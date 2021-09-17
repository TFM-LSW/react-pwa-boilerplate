const webpack = require('webpack');
const Dotenv = require('dotenv-webpack');
const path = require("path");
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const WebpackRemoteTypesPlugin = require('webpack-remote-types-plugin').default;
const ModuleFederationPlugin = require("webpack").container.ModuleFederationPlugin;

module.exports = {
  mode: 'development',
  devtool: 'eval-source-map',
  module: {
    rules: [
      // Loader for TypeScript files in ./src
      {
        test: /\.tsx?$/,
        include: path.resolve(__dirname, '..', './src'),
        exclude: [/node_modules/],
        use: [
          {
            loader: 'babel-loader',
            options: { babelrc: true },
          },
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
              experimentalWatchApi: true,
              configFile: path.resolve(__dirname, '..', './src/tsconfig.json')
            }
          },
        ]
      },
      // Loader for service-worker TypeScript files
      {
        test: /\.tsx?$/,
        include: path.resolve(__dirname, '..', './service-worker'),
        exclude: [/node_modules/],
        use: [
          {
            loader: 'babel-loader',
            options: { babelrc: true },
          },
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
              experimentalWatchApi: true,
              configFile: path.resolve(__dirname, '..', './service-worker/tsconfig.json'),
            },
          },
        ]
      },
    ]
  },
  plugins: [
    new Dotenv({
      path: path.resolve(__dirname, '..', './.env.development'),
    }),
    new WebpackRemoteTypesPlugin({
      remotes: {
        app2: "app2@http://localhost:3002/remoteEntry.js",
      },
      outputDir: 'remote-types', // supports [name] as the remote name
      remoteFileName: '[name]-dts.tgz' // default filename is [name]-dts.tgz where [name] is the remote name, for example, `app` with the above setup
    }),
    new ModuleFederationPlugin({
      name: "app1",
      remotes: {
        app2: "app2@http://localhost:3002/remoteEntry.js",
      },
      shared: {
        "react": { 
          requiredVersion: '17.0.2',
          strictVersion: true,
          singleton: true
        },
        "react-dom": {
          requiredVersion: '17.0.2',
          strictVersion: true,
          singleton: true
        }
      },
    }),
    new HtmlWebpackPlugin({
      // title: 'Hello Webpack bundled JavaScript Project',
      filename: 'index.html',
      template: './index.html',
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: path.resolve(__dirname, '..', './public') }
      ],
    }),

    // new webpack.HotModuleReplacementPlugin(), // not needed
    // Speeds up TypeScript type checking and ESLint linting by moving each to a separate process
    new ForkTsCheckerWebpackPlugin({
      eslint: {
        enabled: true,
        files: './src/**/*.{ts,tsx,js,jsx}' // required - same as command `eslint ./src/**/*.{ts,tsx,js,jsx} --ext .ts,.tsx,.js,.jsx`
      }
    }),
  ],
};
