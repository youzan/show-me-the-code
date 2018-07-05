import { Subject, interval, merge, Subscription, never, race, of } from 'rxjs';
import { webSocket } from 'rxjs/webSocket';
import { mapTo, delay, tap, switchMap, filter, scan, startWith, retry } from 'rxjs/operators';
import { IDisposable } from 'monaco-editor';

export type SocketMessage =
  | {
      type: 'ping';
    }
  | {
      type: 'pong';
    };

const URL = `${window.location.origin.replace(/^http(s?):/, 'ws$1:')}/ws`;

export class ServerConnection implements IDisposable {
  url = URL;
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
    this.initHeartbeat();
    this.connect();
    this.heartbeatSubscription = this.initHeartbeat();
  }

  initHeartbeat() {
    return merge(this.open$.pipe(mapTo(true)), this.closing$.pipe(mapTo(false)))
      .pipe(
        switchMap(connected => (connected ? interval(30000).pipe(startWith(1)) : never())),
        tap(() =>
          this.ws$.next({
            type: 'ping',
          }),
        ),
        switchMap(() =>
          race(
            of(1).pipe(delay(30000)),
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
