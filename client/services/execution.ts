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
    }
  | {
      type: 'stdout';
      data: string[];
    }
  | {
      type: 'stderr';
      data: string[];
    }
  | {
      type: 'execution';
      code: string;
    };

function fromString(s: string) {
  try {
    return JSON.parse(s);
  } catch (error) {
    return s;
  }
}

class Executor implements IDisposable {
  private worker: Worker;
  private message$ = new Subject<WorkerMessage>();
  private subscriptions: Subscription[];

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
    this.subscriptions = [this.handleMessage(), this.heartbeat()];
    this.worker.postMessage({
      type: 'execution',
      code,
    });
  }

  handleMessage() {
    return this.message$.subscribe(data => {
      switch (data.type) {
        case 'close':
          this.executionService.stop(this.id);
          break;
        case 'stdout':
          this.executionService.stdout(this.id, data.data.map(fromString));
          break;
        case 'stderr':
          this.executionService.stderr(this.id, data.data.map(fromString));
          break;
        default:
          break;
      }
    });
  }

  heartbeat() {
    return interval(HEARTBEAT_INTERVAL)
      .pipe(
        startWith(1),
        tap(() => {
          this.worker.postMessage({
            type: 'ping',
          });
        }),
        switchMap(() =>
          race(
            of(1).pipe(delay(5000)),
            this.message$.pipe(
              filter(({ type }) => type === 'pong'),
              mapTo(0),
            ),
          ),
        ),
      )
      .subscribe(value => {
        if (value > 0) {
          this.executionService.kill(this.id, 'Executor not responding');
        }
      });
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

export type Output<T = any> = {
  data: T[];
  id: string;
};

export class ExecutionService implements IDisposable {
  private executors = new Map<string, Executor>();
  stdout$ = new Subject<Output>();
  stderr$ = new Subject<Output<Error>>();

  execute(id: string, type: string, code: string) {
    try {
      const executor = new Executor(this, id, type, code);
      this.executors.set(id, executor);
    } catch (error) {
      toast.error(`Can not execute ${type}`);
    }
  }

  stdout(id: string, data: any[]) {
    this.stdout$.next({
      id,
      data,
    });
  }

  stderr(id: string, data: string[]) {
    this.stderr$.next({
      id,
      data: data.map(it => new Error(it)),
    });
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
    toast.error(reason);
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
