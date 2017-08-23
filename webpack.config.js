const path = require('path');
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const { merge } = require('lodash');

const base = {
  output: {
    path: path.resolve(__dirname, './build'),
    filename: '[name].js'
  },
  resolve: {
    extensions: ['.ts', '.scss', '.js', '.vue', '.jsx', '.tsx', '.css', '.vue']
  },
  devtool: '#source-map'
}

const node = merge({}, base, {
  entry: {
    server: './server/main.ts'
  },
  module: {
    loaders: [
      {
        test: /.(j|t)s$/,
        loader: 'babel-loader',
        options: {
          babelrc: false,
          presets: [
            ['env', {
              targets: {
                node: true
              },
              modules: false
            }],
            'stage-0',
            'typescript'
          ]
        }
      }
    ]
  },
  target: 'node',
  node: {
    __dirname: true
  },
  externals: [{
    'socket.io': 'commonjs socket.io',
    'any-promise': 'commonjs any-promise',
    'fsevents': 'commonjs fsevents',
    'lodash': 'commonjs lodash',
    'uuid': 'commonjs uuid',
    'randomstring': 'commonjs randomstring',
    'sequelize': 'commonjs sequelize'
  }],
  plugins: [
    new CopyPlugin([{
      from: './server/view/**/*',
      to: './view/[name].[ext]'
    }])
  ]
});

const client = merge({}, base, {
  entry: {
    index: './client/index/main.ts',
    room: './client/room/main.ts',
    vendor: ['vue', 'muse-ui', 'socket.io-client', 'vue-class-component', 'axios', 'vue-socket.io', 'vue-monaco']
  },
  output: {
    path: path.resolve(__dirname, './static'),
    filename: '[name].js'
  },
  module: {
    loaders: [
      {
        test: /\.(j|t)s?$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      }, {
        test: /.vue$/,
        loader: 'vue-loader',
        options: {
          loaders: {
            ts: 'babel-loader'
          }
        }
      }, {
        test: /\.(css|scss)$/,
        use: ExtractTextPlugin.extract(['css-loader', 'postcss-loader'])
      }, {
        test: /\.(eot|svg|ttf|woff|woff2)(\?\S*)?$/,
        loader: 'file-loader'
      }, {
        test: /\.(png|jpe?g|gif|svg)(\?\S*)?$/,
        loader: 'file-loader',
        query: {
          name: '[name].[ext]?[hash]'
        }
      }
    ]
  },
  resolve: {
    alias: {
      'socket.io-client': 'socket.io-client/dist/socket.io.js'
    }
  },
  plugins: [
    new ExtractTextPlugin({
      filename: '[name].css',
      allChunks: true
    }),
    new CopyPlugin([{
      from: 'node_modules/monaco-editor/min/vs',
      to: 'vs'
    }]),
    new webpack.optimize.CommonsChunkPlugin({
      name: "vendor",
      minChunks: Infinity
    })
  ]
})

module.exports = [node, client]
