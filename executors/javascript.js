import { stderr, stdout } from './common';

const original = Symbol('original');
const consoleMethods = ['dir', 'log', 'info', 'error', 'warn', 'assert', 'debug', 'timeEnd', 'trace'];
consoleMethods.forEach(method => {
  const originMethod = console[method];
  function patchedMethod(...args) {
    originMethod(...args);
    if (method === 'error') {
      stderr(args);
    } else {
      stdout(args);
    }
  }
  patchedMethod[original] = originMethod;
  console[method] = patchedMethod;
});

onmessage = e => {
  const { data } = e;
  switch (data.type) {
    case 'pong':
      break;
    case 'execution':
      eval(data.code);
      break;
    default:
      break;
  }
};
