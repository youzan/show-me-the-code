const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

const base = {
    output: {
        path: path.resolve(__dirname, './build'),
        filename: '[name].js'
    },
    module: {
        loaders: [
            {
                test: /\.(j|t)s$/,
                loader: 'babel-loader'
            }, {
                test: /\.(eot|svg|ttf|woff|woff2)(\?\S*)?$/,
                loader: 'file-loader'
            }, {
                test: /\.vue$/,
                loader: 'vue-loader'
            },
            {
                test: /\.(png|jpe?g|gif|svg)(\?\S*)?$/,
                loader: 'file-loader',
                query: {
                    name: '[name].[ext]?[hash]'
                }
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.scss', '.js', '.vue']
    }
}

const node = Object.assign({}, base, {
    entry: {
        server: './server/main.ts'
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
        client: './client/main.ts'
    },
    output: {
        path: path.resolve(__dirname, './static'),
        filename: '[name].js'
    },
    plugins: [
        new CopyPlugin([{
            from: 'node_modules/monaco-editor/min/vs',
            to: 'vs'
        }])
    ]
})

module.exports = [node, client]
