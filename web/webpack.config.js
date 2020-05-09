const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const webpack = require('webpack');

module.exports = {
    mode: "development",
    entry: {
        about: './scripts/about.js',
        intro: './scripts/intro.js',
        404: './scripts/404.js'
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'public/scripts'),
    },
    plugins: [
        new webpack.ProvidePlugin({
            $: 'jquery',
            p5: 'p5'
        })
    ],
    optimization: {
        minimizer  : [
            new UglifyJsPlugin({
                uglifyOptions: {
                    mangle: false,
                    keep_fnames: true
                }
            })
        ]
    },
};
