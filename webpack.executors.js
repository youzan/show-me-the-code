const path = require('path');
const webpack = require('webpack');
const AssetsPlugin = require('assets-webpack-plugin');
const CleanPlugin = require('clean-webpack-plugin');
const _ = require('lodash');

const config = require('./config');

const isDev = process.env.NODE_ENV === 'development';

module.exports = {
  mode: isDev ? 'development' : 'production',
  target: 'webworker',
  entry: {
    javascript: './executors/javascript.js',
  },
  output: {
    path: path.resolve(__dirname, 'static'),
    filename: isDev ? '[name].executor.js' : '[name].executor.[chunkhash].js',
    publicPath: config.PUBLIC_PATH,
  },
  plugins: [
    new AssetsPlugin({
      filename: 'executors.assets.js',
      processOutput(assets) {
        return `
if (process.env.NODE_ENV === 'production') {
  module.exports = ${JSON.stringify(_.mapValues(assets, v => v.js))}
} else {
  module.exports = {
    javascript: 'javascript.executor.js'
  }
}
        `;
      },
    }),
    new CleanPlugin(['static']),
    new webpack.ProgressPlugin()
  ],
};
