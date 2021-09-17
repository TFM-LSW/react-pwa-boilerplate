const webpack = require('webpack');
const Dotenv = require('dotenv-webpack');
const WorkboxPlugin = require('workbox-webpack-plugin');
const path = require("path");
const WebpackRemoteTypesPlugin = require('webpack-remote-types-plugin').default;
const ModuleFederationPlugin = require("webpack").container.ModuleFederationPlugin;

module.exports = {
  mode: 'production',
  devtool: 'source-map',
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
              configFile: path.resolve(__dirname, '..', './src/tsconfig.json'),
              transpileOnly: false
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
              configFile: path.resolve(__dirname, '..', './service-worker/tsconfig.json'),
            },
          },
        ]
      },
    ],
  },
  plugins: [
    new Dotenv({
      path: path.resolve(__dirname, '..', './.env.production'),
    }),
    new WorkboxPlugin.GenerateSW({
      // Do not precache images
      exclude: [/\.(?:png|jpg|jpeg|svg)$/],

      // Define runtime caching rules.
      runtimeCaching: [{
        // Match any request that ends with .png, .jpg, .jpeg or .svg.
        urlPattern: /\.(?:png|jpg|jpeg|svg)$/,

        // Apply a cache-first strategy.
        handler: 'CacheFirst',

        options: {
          // Use a custom cache name.
          cacheName: 'images',

          // Only cache 10 images.
          expiration: {
            maxEntries: 10,
          },
        },
      }],
    }),
    new WebpackRemoteTypesPlugin({
      remotes: {
        app2: "app2@https://unruffled-franklin-ac6ac5.netlify.app/remoteEntry.js",
      },
      outputDir: 'remote-types', // supports [name] as the remote name
      remoteFileName: '[name]-dts.tgz' // default filename is [name]-dts.tgz where [name] is the remote name, for example, `app` with the above setup
    }),
    new ModuleFederationPlugin({
      name: "app1",
      remotes: {
        app2: "app2@https://unruffled-franklin-ac6ac5.netlify.app/remoteEntry.js",
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
    })
  ]
};
