const webpack = require('webpack'),
	path = require('path');

module.exports = {
  entry: {
    osm: './src/osm.js',
    index: './src/index.js'
  },

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].bundle.js'
  },
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          {loader: 'style-loader'},
          {loader: 'css-loader'}
        ]
      }
    ]
  },
  devServer: {
    contentBase: './public'
  }
};
