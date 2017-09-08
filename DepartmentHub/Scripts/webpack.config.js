var path = require('path');
var webpack = require('webpack');

module.exports = {
    devtool: 'source-map',
    entry: [
        'babel-polyfill', './src/main.js'
    ],
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'main.bundle.js'
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                query: {
                    presets: ['es2015']
                }
            }
        ]
    },
    stats: {
        colors: true
    },
    devtool: 'source-map'
};
