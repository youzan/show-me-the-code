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
} from 'rxjs/operators';
import { IDisposable } from 'monaco-editor';
import * as uuid from 'uuid/v1';

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
  | [MessageType.JoinReq, string, string, string, string]
  | [MessageType.JoinRes, string, JoinResContent, string, string]
  | [MessageType.JoinAck, string, string, string, string]
  | [MessageType.Offline, string]
  | [MessageType.Connected, string]
  | [MessageType.Error, any?];

type JoinResContent = {
  ok: boolean;
  codeId: string;
  codeName: string;
  codeContent: string;
  language: string;
};

export type SocketMessage =
  | {
      type: MessageType.Ping;
    }
  | {
      type: MessageType.Pong;
    }
  | {
      type: MessageType.JoinReq;
      from: string | null;
      to: string;
      content: string;
    }
  | {
      type: MessageType.JoinRes;
      from: string | null;
      to: string;
      content: JoinResContent;
    }
  | {
      type: MessageType.JoinAck;
      from: string | null;
      to: string;
      content: boolean;
    }
  | {
      type: MessageType.Tunnel;
      from: string | null;
      to: string;
      content: string;
    }
  | {
      type: MessageType.Offline;
      content: string;
    }
  | {
      type: MessageType.Connected;
      content: string;
    }
  | {
      type: MessageType.Error;
      content?: string;
    };

export type JoinCall = {
  type: 'join';
  to: string;
  name: string;
  from?: string;
  requestId?: string;
};

export type Call = JoinCall;

export type JoinResponse = {
  type: 'joinResponse';
  to: string;
  from?: string;
  requestId: string;
  ok: boolean;
  name: string;
  codeId: string;
  codeName: string;
  codeContent: string;
  language: string;
};

export type JoinAck = {
  type: 'joinAck';
  from?: string;
  to: string;
  requestId: string;
  ok: true;
};

export type Response = JoinResponse | JoinAck;

class ServerConnection implements IDisposable {
  private readonly url = SOCKET_URL;
  open$ = new Subject<Event>();
  closing$ = new Subject<void>();
  close$ = new Subject<CloseEvent>();
  private ws$ = webSocket<RawSocketMessage>({
    url: this.url,
    openObserver: this.open$,
    closeObserver: this.close$,
    closingObserver: this.closing$,
  });
  fetal$ = new Subject<any>();
  message$ = new Subject<SocketMessage>();
  private subscription: Subscription | null = null;
  private heartbeatSubscription: Subscription;

  private subscriber = (message: RawSocketMessage) => {
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
          from: message[4],
        });
        break;
      case MessageType.JoinRes:
        this.message$.next({
          type: MessageType.JoinRes,
          to: message[1],
          content: message[2],
          from: message[4],
        });
        break;
      case MessageType.Connected:
        this.message$.next({
          type: MessageType.Connected,
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

  private errorHandler = (error: any) => {
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

const bindSubscription = (s: Subscription) => s.unsubscribe.bind(s);

export class Connection implements IDisposable {
  connection$: Observable<string>;
  message$: Observable<SocketMessage>;
  private serverConnection = new ServerConnection();
  private disposers: Array<() => void>;
  private callMap = new Map<string, Resolver>();

  constructor() {
    this.connection$ = this.serverConnection.message$.pipe(
      filter(({ type }) => type === MessageType.Connected),
      pluck('content'),
    );
    this.message$ = this.serverConnection.message$;
    this.disposers = this.init();
  }

  init(): Array<() => void> {
    return [
      this.serverConnection.dispose.bind(this.serverConnection),
      bindSubscription(
        this.serverConnection.message$.subscribe(msg => {
          switch (msg.type) {
            case MessageType.JoinRes:
              // this.reply(msg);
              break;
            default:
              break;
          }
        }),
      ),
    ];
  }

  connect() {
    this.serverConnection.connect();
  }

  dispose() {
    this.disposers.forEach(disposer => disposer());
  }

  send(t: Call | Response) {
    // this.serverConnection.send(t);
  }

  call<T = Response>(call: Call): Promise<T> {
    call.requestId = call.requestId || uuid();
    return new Promise((resolve, reject) => {
      this.callMap.set(call.requestId as string, {
        resolve,
        reject,
      });
      this.send(call);
    });
  }

  private reply(response: Response) {
    const resolver = this.callMap.get(response.requestId);
    if (!resolver) {
      return;
    }
    if (response.ok) {
      resolver.resolve(response);
    } else {
      resolver.reject(response);
    }
  }
}
