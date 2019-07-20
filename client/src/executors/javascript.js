import { stderr, stdout } from './shared';

const original = Symbol('original');
const consoleMethods = ['dir', 'log', 'info', 'error', 'warn', 'assert', 'debug', 'timeEnd', 'trace'];
consoleMethods.forEach(method => {
  const originMethod = console[method];
  const patchedMethod = (...args) => {
    originMethod(...args);
    if (method === 'error') {
      stderr(...args);
    } else {
      stdout(...args);
    }
  };
  patchedMethod[original] = originMethod;
  console[method] = patchedMethod;
});

onmessage = e => {
  switch (e.data.type) {
    case 'exec':
      eval(e.data.code);
      break;
    default:
      break;
  }
};
