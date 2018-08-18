import { Subject, interval, merge, Subscription, never, race, of, BehaviorSubject, Observable } from 'rxjs';
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

import { SOCKET_URL, HEARTBEAT_INTERVAL } from '../../config';

export type SocketMessage =
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
    this.connect();
    this.heartbeatSubscription = this.initHeartbeat();
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

export class Connection implements IDisposable {
  connection$: Observable<string>;
  private serverConnection = new ServerConnection();
  private disposers: Array<() => void> = [];

  constructor() {
    this.connection$ = this.serverConnection.message$.pipe(
      filter(({ type }) => type === 'connected'),
      pluck('id'),
    );
    this.init();
  }

  init() {
    this.disposers.push(this.serverConnection.dispose.bind(this.serverConnection));
  }

  dispose() {
    this.disposers.forEach(disposer => disposer());
  }
}
