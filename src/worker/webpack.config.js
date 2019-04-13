var path = require('path');
const webpack = require('webpack');

var BUILD_DIR = path.resolve(__dirname, '../../dist');

var config = {
  entry: [
    path.resolve(__dirname, 'App.js')
  ],
  output: {
    path: BUILD_DIR,
    publicPath: '/',
    filename: 'worker_bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.worker\.js$/,
        loader: 'worker-loader'
      }
    ]
  },
  devtool: 'source-map'

}

module.exports = config;
