import { Injectable } from '@angular/core';
import { fromEvent, interval, NextObserver, Observable, of, race, Subject, Subscriber, Subscription } from 'rxjs';
import { delay, filter, map, mapTo, startWith, switchMap, tap } from 'rxjs/operators';
import {autorun, observable} from 'mobx';
import { tryCatch } from 'rxjs/internal-compatibility';

const HEARTBEAT_INTERVAL = 30000;
const HEARTBEAT_TIMEOUT = 5000;

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

function mapEventToMessage(e: MessageEvent): WorkerMessage {
  return e.data;
}

function isPong({ type }: WorkerMessage) {
  return type === 'pong';
}

function toError(msg: string) {
  return new Error(msg);
}

function parse(data: string) {
  try {
    return JSON.parse(data);
  } catch (e) {
    return {};
  }
}

enum Result {
  Ok,
  Err,
}

class WorkerMessageSubscriber implements NextObserver<MessageEvent> {
  constructor(private readonly execution: Execution) {}

  next(e: MessageEvent): void {
    const value: WorkerMessage = e.data;
    switch (value.type) {
      case 'stdout':
        this.execution.stdout(value.data.map(parse));
        break;
      case 'stderr':
        this.execution.stderr(value.data);
        break;
    }
  }
}

class Execution {
  private $heartbeat: Subscription;
  private $message: Subscription;
  private message$: Observable<MessageEvent>;
  readonly output = observable<unknown>([]);

  constructor(private readonly service: ExecutionService, private readonly worker: Worker, code: string) {
    this.message$ = fromEvent<MessageEvent>(this.worker, 'message');
    this.$heartbeat = interval(HEARTBEAT_INTERVAL)
      .pipe(
        startWith(Result.Err),
        tap(this._sendHeartbeat),
        switchMap(this._racePong),
      )
      .subscribe(result => {
        if (result === Result.Err) {
          this.stop();
        }
      });
    this.$message = this.message$.subscribe(new WorkerMessageSubscriber(this));
    this.worker.postMessage({
      type: 'execution',
      code,
    });
    this.worker.onerror = () => {
      this.stop();
    };
    autorun(() => {
      console.log(this.output.length)
    })
  }

  stdout(data: unknown[]) {
    this.output.push(...data);
  }

  stderr(data: string[]) {
    this.output.push(...data.map(toError));
  }

  stop() {
    this.worker.terminate();
    this.$heartbeat.unsubscribe();
    this.$message.unsubscribe();
  }

  private _sendHeartbeat = () => {
    this.worker.postMessage({
      type: 'ping',
    });
  };

  private _racePong = () => {
    return race(
      of(1).pipe(delay(HEARTBEAT_TIMEOUT)),
      this.message$.pipe(
        map(mapEventToMessage),
        filter(isPong),
        mapTo(Result.Ok),
      ),
    );
  };
}

@Injectable()
export class ExecutionService {
  private readonly executions = new Set<Execution>();

  execute(language: string, code: string) {
    console.log(language, code);
    switch (language) {
      case 'javascript':
        this.executeJavaScript(code);
        break;
      default:
        break;
    }
  }

  removeExecution(executuon: Execution) {
    this.executions.delete(executuon);
  }

  executeJavaScript(code) {
    console.log(code);
    const worker = new Worker('../executors/javascript', { type: 'module' });
    const execution = new Execution(this, worker, code);
    this.executions.add(execution);
  }
}
