const webpack = require('webpack');
const path = require('path');

module.exports = {
    entry: './main.js',
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'bundle.js' },
    module: {
        loaders: [
            {
                test: /.jsx?$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                query: {
                    presets: ['es2015', 'react']
                }
            },
            {
                test: /\.scss$/,
                loader: ['style-loader', 'css-loader', 'sass-loader']
            }
        ]
    }
};