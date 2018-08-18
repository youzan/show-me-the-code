import 'zone.js';

export class NoopExecutor {
  constructor() {
    this._hasTask = true;
    this._endReached = false;
    setInterval(() => {
      postMessage({
        type: 'ping',
      });
    }, 30000);
    onmessage = e => {
      const { data } = e;
      switch (data.type) {
        case 'pong':
          break;
        case 'execution':
          this.onExecute(data.code);
          break;
        default:
          break;
      }
    }
  }

  stdout(data) {
    postMessage({
      type: 'stdout',
      data: JSON.stringify(data),
    });
  }

  stderr(data) {
    postMessage({
      type: 'stderr',
      data: JSON.stringify(data),
    });
  }

  onExecute(code) {
    // noop
  }

  doExec(f) {
    const zone = Zone.current.fork({
      onHasTask(parentZoneDelegate, currentZone, targetZone, hasTaskState) {
        if (hasTaskState.eventTask + hasTaskState.macroTask + hasTaskState.microTask === 0) {
          this._hasTask = false;
        }
        this._end();
      },
    });
    zone.run(f);
    this._endReached = true;
    this._end();
  }

  _end() {
    if (!this.hasTask && this.endReached) {
      postMessage({
        type: 'close',
      });
      close();
    }
  }
}
