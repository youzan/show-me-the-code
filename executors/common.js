import 'zone.js';

export const isExecutionZone = Symbol();

function getString(e) {
  if (e instanceof Error) {
    return e.message;
  }
  if (typeof e === 'symbol') {
    return e.toString();
  }
  try {
    return JSON.stringify(e);
  } catch (error) {
    return '' + e;
  }
}

export class NoopExecutor {
  constructor() {
    this._hasTask = false;
    this._endReached = false;
    onmessage = e => {
      const { data } = e;
      switch (data.type) {
        case 'pong':
          break;
        case 'execution':
          this.onExecute(data.code);
          break;
        case 'ping':
          postMessage({
            type: 'pong',
          });
          break;
        default:
          break;
      }
    };
  }

  stdout(...data) {
    postMessage({
      type: 'stdout',
      data: data.map(getString),
    });
  }

  stderr(...data) {
    postMessage({
      type: 'stderr',
      data: data.map(getString),
    });
  }

  onExecute(code) {
    // noop
  }

  doExec(f) {
    const zone = Zone.current.fork({
      onHasTask: (parentZoneDelegate, currentZone, targetZone, hasTaskState) => {
        if (hasTaskState.eventTask || hasTaskState.macroTask || hasTaskState.microTask) {
          this._hasTask = true;
        } else {
          this._hasTask = false;
        }
        this._end();
      },
      onHandleError: error => {
        this.stderr(error);
        return true;
      },
      properties: {
        [isExecutionZone]: true
      }
    });
    zone.run(f);
    this._endReached = true;
    this._end();
  }

  _end() {
    if (!this._hasTask && this._endReached) {
      postMessage({
        type: 'close',
      });
      close();
    }
  }
}
