const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const BrotliGzipPlugin = require('brotli-gzip-webpack-plugin');
const path = require('path');

module.exports = {
    entry: {
        app: './src/bundles/app.js',
        lib: './src/bundles/lib.js',
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].[contentHash].bundle.js',
    },
    optimization: {
        minimizer: [
            new OptimizeCssAssetsPlugin(),
            new TerserPlugin(),
        ],
    },
    mode: 'production',
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            chunks: ['app', 'lib'],
            filename: 'index.html',
            template: './src/index.html'
        }),
        new HtmlWebpackPlugin({
            chunks: ['lib'],
            filename: 'errors/404.html',
            template: './src/errors/404.html'
        }),
        new HtmlWebpackPlugin({
            chunks: ['lib'],
            filename: 'errors/50x.html',
            template: './src/errors/50x.html'
        }),
        new BrotliGzipPlugin({
            asset: '[path].br[query]',
            algorithm: 'brotli',
            test: /\.(js|css|html|wasm)$/,
        }),
        new BrotliGzipPlugin({
            asset: '[path].gz[query]',
            algorithm: 'gzip',
            test: /\.(js|css|html|wasm)$/,
        }),
        new MiniCssExtractPlugin({filename: '[name].[contentHash].css'}),
    ],
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                ]
            },
        ]
    },
};