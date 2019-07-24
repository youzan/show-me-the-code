const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const WorkerPlugin = require('worker-plugin');

exports.default = {
  config(cfg) {
    cfg.plugins.push(new MonacoWebpackPlugin(), new WorkerPlugin());
    for (const rule of cfg.module.rules) {
      if (rule.test.toString() === '/\\.css$/' && rule.exclude) {
        rule.exclude.push(/monaco-editor/);
        break;
      }
    }
    cfg.node = cfg.node || {};
    cfg.node.fs = 'empty';
    cfg.node.module = 'empty';
    return cfg;
  },
};
