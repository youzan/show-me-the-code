import { Subject, interval, merge, Subscription, never, race, of, Observable } from 'rxjs';
import { webSocket } from 'rxjs/webSocket';
import {
  mapTo,
  delay,
  tap,
  switchMap,
  filter,
  scan,
  startWith,
  retry,
  distinctUntilChanged,
  pluck,
  map,
} from 'rxjs/operators';
import { IDisposable } from 'monaco-editor';

import { SOCKET_URL, HEARTBEAT_INTERVAL } from '../../config';

export enum MessageType {
  Ping = 0,
  Pong = 1,
  JoinReq = 2,
  JoinRes = 3,
  JoinAck = 4,
  Tunnel = 5,
  Offline = 6,
  Connected = 7,
  Error = 999,
}

/**
 * [type, to, content, request_id, from]
 */
type RawSocketMessage =
  | [MessageType.Ping]
  | [MessageType.Pong]
  | [MessageType.JoinReq, string, string, string, string?]
  | [MessageType.JoinRes, string, JoinResContent, string, string?]
  | [MessageType.JoinAck, string, boolean, string, string?]
  | [MessageType.Offline, string]
  | [MessageType.Connected, string]
  | [MessageType.Error, any?];

type JoinResContent =
  | {
      ok: false;
    }
  | {
      ok: true;
      codeId: string;
      codeName: string;
      codeContent: string;
      language: string;
      hostName: string;
    };

export type JoinResMessage = {
  type: MessageType.JoinRes;
  from: string | null;
  to: string;
  content: JoinResContent;
  requestId: string;
};

export type JoinReqMessage = {
  type: MessageType.JoinReq;
  from: string | null;
  to: string;
  content: string;
  requestId: string;
};

export type OfflineMessage = {
  type: MessageType.Offline;
  content: string;
}

export type SocketMessage =
  | {
      type: MessageType.Ping;
    }
  | {
      type: MessageType.Pong;
    }
  | JoinReqMessage
  | JoinResMessage
  | {
      type: MessageType.JoinAck;
      from: string | null;
      to: string;
      content: boolean;
      requestId: string;
    }
  | {
      type: MessageType.Tunnel;
      from: string | null;
      to: string;
      content: string;
    }
  | OfflineMessage
  | {
      type: MessageType.Connected;
      content: string;
    }
  | {
      type: MessageType.Error;
      content?: string;
    };

export type Message = SocketMessage;

class ServerConnection implements IDisposable {
  private readonly url = SOCKET_URL;
  readonly open$ = new Subject<Event>();
  readonly closing$ = new Subject<void>();
  readonly close$ = new Subject<CloseEvent>();
  readonly ws$ = webSocket<RawSocketMessage>({
    url: this.url,
    openObserver: this.open$,
    closeObserver: this.close$,
    closingObserver: this.closing$,
  });
  readonly fetal$ = new Subject<any>();
  readonly message$ = new Subject<SocketMessage>();
  private subscription: Subscription | null = null;
  private readonly heartbeatSubscription: Subscription;

  private readonly subscriber = (message: RawSocketMessage) => {
    switch (message[0]) {
      case MessageType.Ping:
        this.message$.next({
          type: MessageType.Ping,
        });
        break;
      case MessageType.Pong:
        this.message$.next({
          type: MessageType.Pong,
        });
        break;
      case MessageType.JoinReq:
        this.message$.next({
          type: MessageType.JoinReq,
          to: message[1],
          content: message[2],
          requestId: message[3],
          from: message[4]
            ? message[4]
            : (() => {
                throw new Error();
              })(),
        });
        break;
      case MessageType.JoinRes:
        this.message$.next({
          type: MessageType.JoinRes,
          to: message[1],
          content: message[2],
          requestId: message[3],
          from: message[4]
            ? message[4]
            : (() => {
                throw new Error();
              })(),
        });
        break;
      case MessageType.JoinAck:
        this.message$.next({
          type: MessageType.JoinAck,
          to: message[1],
          content: message[2],
          requestId: message[3],
          from: message[4]
            ? message[4]
            : (() => {
                throw new Error();
              })(),
        });
        break;
      case MessageType.Connected:
        this.message$.next({
          type: MessageType.Connected,
          content: message[1],
        });
      case MessageType.Offline:
        this.message$.next({
          type: MessageType.Offline,
          content: message[1],
        });
      default:
        this.message$.next({
          type: MessageType.Error,
          content:
            'Unknown message type from server. This is probably caused by your client version differnt with server. If not, it is a bug, please submit an issue.',
        });
        break;
    }
  };

  private readonly errorHandler = (error: any) => {
    this.fetal$.next(error);
  };

  constructor() {
    this.heartbeatSubscription = this.initHeartbeat();
  }

  private initHeartbeat() {
    return merge(this.open$.pipe(mapTo(true)), this.closing$.pipe(mapTo(false)))
      .pipe(
        distinctUntilChanged(),
        switchMap(connected => (connected ? interval(HEARTBEAT_INTERVAL).pipe(startWith(1)) : never())),
        tap(() => {
          this.send({
            type: MessageType.Ping,
          });
        }),
        switchMap(() =>
          race(
            of(1).pipe(delay(HEARTBEAT_INTERVAL)),
            this.message$.pipe(
              filter(msg => msg.type === MessageType.Pong),
              mapTo(0),
            ),
          ),
        ),
        scan((count, v) => count + v, 0),
      )
      .subscribe(value => {
        if (value > 0) {
          // connect performs reconnect
          this.connect();
        }
      });
  }

  connect() {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
    this.subscription = this.ws$.pipe(retry(5)).subscribe(this.subscriber, this.errorHandler);
  }

  send(msg: SocketMessage) {
    switch (msg.type) {
      case MessageType.Ping:
        this.ws$.next([MessageType.Ping]);
        break;
      case MessageType.Pong:
        this.ws$.next([MessageType.Pong]);
        break;
      default:
        break;
    }
  }

  dispose() {
    this.subscription && this.subscription.unsubscribe();
    this.heartbeatSubscription.unsubscribe();
  }
}

type Resolver = {
  resolve(response: any): void;
  reject(response: any): void;
};

export class Connection implements IDisposable {
  connection$: Observable<string>;
  disconnect$: Observable<void>;
  message$: Observable<SocketMessage>;
  private serverConnection = new ServerConnection();
  private disposers: Array<() => void>;
  private callMap = new Map<string, Resolver>();

  constructor() {
    this.connection$ = this.serverConnection.message$.pipe(
      filter(({ type }) => type === MessageType.Connected),
      pluck('content'),
    );
    this.disconnect$ = this.serverConnection.close$.pipe(map(() => {}));
    this.message$ = this.serverConnection.message$;
    this.disposers = this.init();
  }

  init(): Array<() => void> {
    return [this.serverConnection.dispose.bind(this.serverConnection)];
  }

  connect() {
    this.serverConnection.connect();
  }

  dispose() {
    this.disposers.forEach(disposer => disposer());
  }

  send(t: Message) {
    switch (t.type) {
      case MessageType.Ping:
        return this._send([MessageType.Ping]);
      case MessageType.Pong:
        return this._send([MessageType.Pong]);
      case MessageType.JoinReq:
        return this._send([MessageType.JoinReq, t.to, t.content, t.requestId]);
      case MessageType.JoinRes:
        return this._send([MessageType.JoinRes, t.to, t.content, t.requestId]);
      case MessageType.JoinAck:
        return this._send([MessageType.JoinAck, t.to, t.content, t.requestId]);
      default:
        break;
    }
  }

  private _send(raw: RawSocketMessage) {
    const requestId: string | undefined = raw[4];
    if (requestId) {
      return new Promise((resolve, reject) => {
        this.callMap.set(requestId, {
          resolve,
          reject,
        });
        this.serverConnection.ws$.next(raw);
      });
    }
    this.serverConnection.ws$.next(raw);
  }
}
