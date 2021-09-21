const webpack = require('webpack');
const path = require("path");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'none',
  module: {
    rules: [
      {
        test: /\.s[ac]ss$/i,
        use: [
          // Creates `style` nodes from JS strings
          'style-loader',
          // Translates CSS into CommonJS
          'css-loader',
          // Compiles Sass to CSS
          'sass-loader',
        ],
      },
      /* {
        test: /\.tsx?$/,
        // enforce: 'pre',
        include: [path.resolve(__dirname, './src'), path.resolve(__dirname, './service-worker')],
        use: [
          { loader: 'eslint-loader', options: { emitErrors: true } },
        ],
      }, */
      {
        test: /bootstrap\.tsx$/,
        loader: "bundle-loader",
        options: {
          lazy: true,
        },
      },
    ],
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
  },
  output: {
    // path: path.resolve(__dirname, './dist'),
    publicPath: '/',
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: path.resolve(__dirname, '..', './public') }
      ],
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, '..', "dist"),
    },
    port: 3001,
    open: true,
    compress: false,
    hot: true,
  },
};
