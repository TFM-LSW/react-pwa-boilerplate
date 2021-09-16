const webpack = require('webpack');
const WorkboxPlugin = require('workbox-webpack-plugin');
const { InjectManifest } = require("workbox-webpack-plugin");
const path = require("path");
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const WebpackRemoteTypesPlugin = require('webpack-remote-types-plugin').default;
const ModuleFederationPlugin =
  require("webpack").container.ModuleFederationPlugin;

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  // In dev mode we use ForkTsCheckerWebpackPlugin for type checking, which is faster when re-compiling
  const tsConfigOptions = isProduction ? {} : {
    transpileOnly: true,
    experimentalWatchApi: true,
  }

  return {
    // context: __dirname, // to automatically find tsconfig.json
    entry: './src/index.tsx',
    devtool: 'source-map',
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
        // Loader for TypeScript files in ./src
        {
          test: /\.tsx?$/,
          include: path.resolve(__dirname, './src'),
          exclude: [/node_modules/],
          use: [
            {
              loader: 'babel-loader',
              options: { babelrc: true },
            },
            {
              loader: 'ts-loader',
              options: {
                ...tsConfigOptions,
                configFile: path.resolve(__dirname, './src/tsconfig.json'),
                transpileOnly: false
              }
            },
          ]
        },
        // Loader for service-worker TypeScript files
        {
          test: /\.tsx?$/,
          include: path.resolve(__dirname, './service-worker'),
          exclude: [/node_modules/],
          use: [
            {
              loader: 'babel-loader',
              options: { babelrc: true },
            },
            {
              loader: 'ts-loader',
              options: {
                ...tsConfigOptions,
                configFile: path.resolve(__dirname, './service-worker/tsconfig.json'),
              },
            },
          ]
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
        shared: {"react": { requiredVersion: '17.0.2', strictVersion: true, singleton: true }, "react-dom": { requiredVersion: '17.0.2', strictVersion: true, singleton: true }},
      }),
      new HtmlWebpackPlugin({
        filename: 'index.html',
        template: './index.html',
      }),

      new CopyWebpackPlugin({
        patterns: [
          { from: path.resolve(__dirname, './public') }
        ],
      }),

      // new webpack.HotModuleReplacementPlugin(), // not needed

      ...(isProduction ? [] : [
        // Speeds up TypeScript type checking and ESLint linting by moving each to a separate process
        new ForkTsCheckerWebpackPlugin({
          eslint: {
            enabled: true,
            files: './src/**/*.{ts,tsx,js,jsx}' // required - same as command `eslint ./src/**/*.{ts,tsx,js,jsx} --ext .ts,.tsx,.js,.jsx`
          }
        }),
      ]),
    ],
    devServer: {
      static: {
        directory: path.join(__dirname, "dist"),
      },
      port: 3003,
      open: true,
      compress: false,
      hot: true,
    },
  };
};
