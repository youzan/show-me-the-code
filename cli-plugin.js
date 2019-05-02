const { NamedChunksPlugin } = require('webpack');
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
    cfg.plugins.push(
      new MonacoEditorPlugin(),
      new WorkerPlugin(),
      new NamedChunksPlugin(chunk => {
        if (chunk.name) {
          return chunk.name;
        }
        const regex = /(.+)monaco\-editor\/esm\/(.*)/;
        for (const m of chunk._modules) {
          if (regex.test(m.context)) {
            return m.context.replace(regex, '$2');
          }
        }
        return null;
      }),
    );
    return cfg;
  },
  post() {},
};

exports.default = plugin;
