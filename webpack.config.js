const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

const base = {
  output: {
    path: path.resolve(__dirname, './build'),
    filename: '[name].js'
  },
  resolve: {
    extensions: ['.ts', '.scss', '.js', '.vue', '.jsx', '.tsx']
  },
  devtool: '#source-map'
}

const node = Object.assign({}, base, {
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
    'fsevents': 'commonjs fsevents'
  }],
  plugins: [
    new CopyPlugin([{
      from: './server/view/**/*',
      to: './view/[name].[ext]'
    }])
  ]
});

const client = Object.assign({}, base, {
  entry: {
    client: './client/main.tsx'
  },
  output: {
    path: path.resolve(__dirname, './static'),
    filename: '[name].js'
  },
  module: {
    loaders: [
      {
        test: /\.(j|t)sx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        options: {
          babelrc: false,
          plugins: [
            'syntax-jsx',
            'transform-react-jsx',
            'transform-react-display-name',
            'zent'
          ],
          presets: [
            ['env', {
              targets: {
                browsers: 'ie >= 10, firefox >= 11, chrome >= 15, safari >= 7, opera >= 12.1'
              },
              modules: false
            }],
            'stage-0',
            'typescript'
          ]
        }
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
  plugins: [
    new CopyPlugin([{
      from: 'node_modules/monaco-editor/min/vs',
      to: 'vs'
    }])
  ]
})

module.exports = [node, client]
