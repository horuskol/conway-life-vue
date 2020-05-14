const path = require('path');

const VueLoaderPlugin = require('vue-loader/lib/plugin');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname) + '/public',
        filename: 'app.js'
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader',
            },
            // this will apply to both plain `.js` files
            // AND `<script>` blocks in `.vue` files
            {
                test: /\.js$/,
                loader: 'babel-loader'
            },
            // this will apply to both plain `.css` files
            // AND `<style>` blocks in `.vue` files
            {
                test: /\.css$/,
                use: [
                    'vue-style-loader',
                    'css-loader'
                ]
            }
        ]
    },
    plugins: [
        new VueLoaderPlugin(),
        new BrowserSyncPlugin({
            host: 'localhost',
            port: 3000,
            server: './public'
        })
    ],
    resolve: {
        extensions: ['.js', '.vue'],
        alias: {
            vue: 'vue/dist/vue.common.js'
        }
    }
};