import * as uuid from 'uuid/v1';
import { Subject, Subscription, interval, of, race } from 'rxjs';
import { startWith, switchMap, delay, filter, mapTo, tap } from 'rxjs/operators';
import { toast } from 'react-toastify';

import { EXECUTORS, HEARTBEAT_INTERVAL } from '../../config';
import { IDisposable } from 'monaco-editor';

type WorkerMessage =
  | {
      type: 'ping';
    }
  | {
      type: 'pong';
    }
  | {
      type: 'close';
    };

class Executor implements IDisposable {
  private worker: Worker;
  private timeoutCount = 0;
  private timtoutTimer = 0;
  private intervalTimer = 0;
  private message$ = new Subject<WorkerMessage>();
  private subscriptions: Subscription[] = [];

  constructor(
    private readonly executionService: ExecutionService,
    public readonly id: string,
    public readonly type: string,
    public readonly code: string,
  ) {
    const url = EXECUTORS[type];
    if (!url) {
      throw new Error();
    }
    this.worker = new Worker(url);
    this.worker.onmessage = e => {
      this.message$.next(e.data);
    };
    this.subscriptions.push(
      this.message$.subscribe(data => {
        switch (data.type) {
          case 'close':
            this.executionService.stop(this.id);
            break;
          default:
            break;
        }
      }),
      interval(HEARTBEAT_INTERVAL)
        .pipe(
          startWith(1),
          tap(() => {
            this.worker.postMessage({
              type: 'ping',
            });
          }),
          switchMap(() =>
            race(
              of(1).pipe(delay(30000)),
              this.message$.pipe(
                filter(({ type }) => type === 'pong'),
                mapTo(0),
              ),
            ),
          ),
        )
        .subscribe(value => {
          if (value > 0) {
            this.executionService.kill(this.id, 'Execution not responding');
          }
        }),
    );
  }

  kill() {
    this.worker.terminate();
  }

  dispose() {
    this.worker.onmessage = null;
    this.worker.onerror = null;
    this.subscriptions.forEach(subscription => {
      subscription.unsubscribe();
    });
  }
}

export class ExecutionService implements IDisposable {
  executors = new Map<string, Executor>();

  execute(type: string, code: string) {
    const id = uuid();
    try {
      const executor = new Executor(this, id, type, code);
      this.executors.set(id, executor);
    } catch (error) {
      toast(`Can not execute ${type}`);
    }
  }

  stop(id: string) {
    const executor = this.executors.get(id);
    if (!executor) {
      return;
    }
    this.executors.delete(id);
    executor.dispose();
  }

  kill(id: string, reason?: string) {
    const executor = this.executors.get(id);
    if (!executor) {
      return;
    }
    this.executors.delete(id);
    executor.dispose();
    executor.kill();
    toast(reason);
  }

  killAll() {
    this.executors.forEach(executor => {
      executor.kill();
      executor.dispose();
    });
    this.executors.clear();
  }

  dispose() {
    this.executors.forEach(executor => {
      executor.dispose();
    });
  }
}
