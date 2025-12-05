// Generated using webpack-cli https://github.com/webpack/webpack-cli

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

const isProduction = process.env.NODE_ENV === 'production';

const stylesHandler = 'style-loader';

const dotenv = require('dotenv');
const env = dotenv.config().parsed || {};

const envKeys = Object.keys(env).reduce((prev, next) => {
  prev[`process.env.${next}`] = JSON.stringify(env[next]);
  return prev;
}, {});

const config = {
  entry: './src/index.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
    clean: true,
    publicPath: '/',
  },
  devServer: {
    historyApiFallback: true,
    open: true,
    host: 'localhost',
    static: {
      directory: path.resolve(__dirname, 'dist'),
    },
    compress: true,
    port: 8081,
    proxy: [
      {
        context: ['/api'], // alles unter /api weiterleiten
        target: 'http://localhost:8080', // dein Spring-Backend
        changeOrigin: true,
        secure: false,
        logLevel: 'debug', // Proxy-Logs im Terminal
        // optional: pathRewrite: { '^/api': '/api' } // nicht nötig, nur Beispiel
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({ template: './public/index.html' }),
    new webpack.DefinePlugin(envKeys),
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/i,
        loader: 'ts-loader',
        exclude: ['/node_modules/'],
      },
      {
        test: /\.css$/i,
        use: [stylesHandler, 'css-loader'],
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
        type: 'asset',
      },

      // Add your rules for custom modules here
      // Learn more about loaders from https://webpack.js.org/loaders/
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js', '...'],
    alias: {
      'process/browser': require.resolve('process/browser.js'),
    },
  },
  ignoreWarnings: [
    // ignoriert alle fehlenden source map Warnungen in node_modules
    (warning) =>
      warning.module &&
      warning.module.resource &&
      warning.module.resource.includes('node_modules') &&
      warning.message.includes('source map'),
  ],
};

module.exports = () => {
  return {
    ...config,
    mode: isProduction ? 'production' : 'development',
    devtool: isProduction ? 'source-map' : 'cheap-module-source-map',
  };
};
