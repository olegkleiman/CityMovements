var path = require('path');
const webpack = require('webpack');
var Visualizer = require('webpack-visualizer-plugin');

var BUILD_DIR = path.resolve(__dirname, 'dist');

var config = {
  entry: [
    'babel-polyfill',
    path.resolve(__dirname, './src/index.jsx')
  ],
  output: {
    path: BUILD_DIR,
    publicPath: '/',
    filename: 'bundle.js',
    globalObject: 'this' // See: https://github.com/webpack/webpack/issues/6642
  },
  stats: {
    colors: true,
    reasons: true,
    chunks: true
  },
  resolve: {
      extensions: ['.js', '.jsx', '.css']
  },
  module: {
    rules: [
      {
        test: /\.jsx$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.worker\.js$/,
        loader: 'worker-loader'
      }
    ]
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 8081,
    stats: 'errors-only'
  },
  devtool: 'source-map',
  plugins: [
    new webpack.EnvironmentPlugin({
      MapboxAccessToken: 'pk.eyJ1Ijoib2xlZ2tsZWltYW4iLCJhIjoiY2p1MzliZjJ1MGRkNTRkanR0YW16OWxlOCJ9._UGnwB2vBL9UVKEEiJ8L9g'
    }),
    new Visualizer()
  ]

};

module.exports = config;
