import * as Babel from '@babel/standalone';
import { NoopExecutor, isExecutionZone } from './common';

// @ts-check
class JavaScriptExecutor extends NoopExecutor {
  constructor() {
    super();
    this.patchConsole();
  }

  onExecute(code) {
    this.doExec(() => {
      const output = Babel.transform(code, {
        plugins: ['transform-async-to-generator'],
      }).code;
      eval(output);
    });
  }

  patchConsole() {
    const original = Symbol('original');
    const consoleMethods = ['dir', 'log', 'info', 'error', 'warn', 'assert', 'debug', 'timeEnd', 'trace'];
    consoleMethods.forEach(method => {
      const originMethod = console[method];
      const patchedMethod = (...args) => {
        originMethod(...args);
        if (!Zone.current.get(isExecutionZone)) {
          return;
        }
        if (method === 'error') {
          this.stderr(...args);
        } else {
          this.stdout(...args);
        }
      };
      patchedMethod[original] = originMethod;
      console[method] = patchedMethod;
    });
  }
}

new JavaScriptExecutor();
