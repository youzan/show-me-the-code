import 'zone.js';

setInterval(() => {
  postMessage({
    type: 'ping',
  });
}, 30000);

export function stdout(data) {
  postMessage({
    type: 'stdout',
    data: JSON.stringify(data),
  });
}

export function stderr(data) {
  postMessage({
    type: 'stderr',
    data: JSON.stringify(data),
  });
}

let hasTask = true;
let endReached = false;

function end() {
  if (!hasTask && endReached) {
    postMessage({
      type: 'close',
    });
    close();
  }
}

export function exec(f) {
  const zone = Zone.current.fork({
    onHasTask(parentZoneDelegate, currentZone, targetZone, hasTaskState) {
      if (hasTaskState.eventTask + hasTaskState.macroTask + hasTaskState.microTask === 0) {
        hasTask = false;
      }
      end();
    },
  });
  zone.run(f);
  endReached = true;
  end();
}
