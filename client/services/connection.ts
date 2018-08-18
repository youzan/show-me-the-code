import { Subject, interval, merge, Subscription, never, race, of } from 'rxjs';
import { webSocket } from 'rxjs/webSocket';
import { mapTo, delay, tap, switchMap, filter, scan, startWith, retry, distinctUntilChanged } from 'rxjs/operators';
import { IDisposable } from 'monaco-editor';

import { SOCKET_URL, HEARTBEAT_INTERVAL } from '../../config';

export type SocketMessage =
  | {
    type: 'ping';
  }
  | {
    type: 'pong';
  };

export class ServerConnection implements IDisposable {
  url = SOCKET_URL;
  open$ = new Subject<Event>();
  closing$ = new Subject<void>();
  close$ = new Subject<CloseEvent>();
  ws$ = webSocket<SocketMessage>({
    url: this.url,
    openObserver: this.open$,
    closeObserver: this.close$,
    closingObserver: this.closing$,
  });
  fetal$ = new Subject<any>();
  message$ = new Subject<SocketMessage>();
  subscription: Subscription | null = null;
  heartbeatSubscription: Subscription;

  subscriber = (message: SocketMessage) => {
    this.message$.next(message);
  };

  errorHandler = (error: any) => {
    this.fetal$.next(error);
  };

  constructor() {
    this.connect();
    this.heartbeatSubscription = this.initHeartbeat();
  }

  initHeartbeat() {
    return merge(this.open$.pipe(mapTo(true)), this.closing$.pipe(mapTo(false)))
      .pipe(
        distinctUntilChanged(),
        switchMap(connected => (connected ? interval(HEARTBEAT_INTERVAL) : never())),
        tap(() => {
          console.log('sending ping')
          this.ws$.next({
            type: 'ping'
          })
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
