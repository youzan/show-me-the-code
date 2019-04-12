const MonacoEditorPlugin = require('monaco-editor-webpack-plugin');
const WorkerPlugin = require('worker-plugin');

const plugin = {
  pre() {},
  config(cfg) {
    for (const rule of cfg.module.rules) {
      if (rule.test.toString() === '/\\.css$/') {
        if (rule.exclude) {
          rule.exclude.push(/node_modules\/monaco-editor/);
        }
      }
    }
    cfg.plugins.push(new MonacoEditorPlugin(), new WorkerPlugin());
    return cfg;
  },
  post() {},
};

exports.default = plugin;
