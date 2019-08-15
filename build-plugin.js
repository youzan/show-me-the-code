const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const WorkerPlugin = require('worker-plugin');

exports.default = {
  config(cfg) {
    cfg.plugins.push(
      new MonacoWebpackPlugin(),
      new WorkerPlugin({
        globalObject: 'self',
      }),
    );
    for (const rule of cfg.module.rules) {
      if (rule.test.toString() === '/\\.css$/' && rule.exclude) {
        rule.exclude.push(/monaco-editor/);
        break;
      }
    }
    cfg.node = cfg.node || {};
    cfg.node.fs = 'empty';
    cfg.node.module = 'empty';

    // workaround for https://github.com/angular/angular-cli/issues/14033
    const loader = cfg.module.rules.find(
      rule => rule.use && rule.use.find(it => it.loader === '@angular-devkit/build-optimizer/webpack-loader'),
    );
    if (loader) {
      const originalTest = loader.test;
      loader.test = file => {
        const isMonaco = !!file.match('node_modules/monaco-editor');
        return !isMonaco && !!file.match(originalTest);
      };
    }

    cfg.resolve.extensions.push('.bs.js', '.proto.js');

    return cfg;
  },
};
