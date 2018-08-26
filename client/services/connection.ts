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

export type Call = {
  type: 'join';
  to: string;
  from?: string;
  requestId: string;
};

export type Response = {
  type: 'joinResponse';
  to: string;
  from?: string;
  requestId: string;
  ok: boolean;
  codeId: string;
  codeName: string;
  codeContent: string;
  language: string;
};

type SocketMessage =
  | Call
  | Response
  | {
      type: 'ping';
    }
  | {
      type: 'pong';
    }
  | {
      type: 'connected';
      id: string;
    };

class ServerConnection implements IDisposable {
  private readonly url = SOCKET_URL;
  open$ = new Subject<Event>();
  closing$ = new Subject<void>();
  close$ = new Subject<CloseEvent>();
  private ws$ = webSocket<SocketMessage>({
    url: this.url,
    openObserver: this.open$,
    closeObserver: this.close$,
    closingObserver: this.closing$,
  });
  fetal$ = new Subject<any>();
  message$ = new Subject<SocketMessage>();
  private subscription: Subscription | null = null;
  private heartbeatSubscription: Subscription;

  private subscriber = (message: SocketMessage) => {
    this.message$.next(message);
  };

  private errorHandler = (error: any) => {
    this.fetal$.next(error);
  };

  constructor() {
    this.heartbeatSubscription = this.initHeartbeat();
  }

  send(message: any) {
    this.ws$.next(message);
  }

  private initHeartbeat() {
    return merge(this.open$.pipe(mapTo(true)), this.closing$.pipe(mapTo(false)))
      .pipe(
        distinctUntilChanged(),
        switchMap(connected => (connected ? interval(HEARTBEAT_INTERVAL).pipe(startWith(1)) : never())),
        tap(() => {
          this.ws$.next({
            type: 'ping',
          });
        }),
        switchMap(() =>
          race(
            of(1).pipe(delay(HEARTBEAT_INTERVAL)),
            this.ws$.pipe(
              filter(msg => msg.type === 'pong'),
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

  dispose() {
    this.subscription && this.subscription.unsubscribe();
    this.heartbeatSubscription.unsubscribe();
  }
}

type Resolver = {
  resolve(response: Response): void;
  reject(response: Response): void;
};

const bindSubscription = (s: Subscription) => s.unsubscribe.bind(s);

export class Connection implements IDisposable {
  connection$: Observable<string>;
  private serverConnection = new ServerConnection();
  private disposers: Array<() => void>;
  private callMap = new Map<string, Resolver>();

  constructor() {
    this.connection$ = this.serverConnection.message$.pipe(
      filter(({ type }) => type === 'connected'),
      pluck('id'),
    );
    this.disposers = this.init();
  }

  init(): Array<() => void> {
    return [
      this.serverConnection.dispose.bind(this.serverConnection),
      bindSubscription(
        this.serverConnection.message$.subscribe(msg => {
          switch (msg.type) {
            case 'joinResponse':
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

  call(call: Call): Promise<Response> {
    call.requestId = call.requestId || uuid();
    return new Promise((resolve, reject) => {
      this.callMap.set(call.requestId, {
        resolve,
        reject,
      });
      this.serverConnection.send(call);
    });
  }

  // private reply(response: Response) {
  //   const resolver = this.callMap.get(response.requestId);
  //   if (!resolver) {
  //     return;
  //   }
  //   if (response.ok) {
  //     resolver.resolve(response);
  //   } else {
  //     resolver.reject(response);
  //   }
  // }
}
