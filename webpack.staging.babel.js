import path from 'path';
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import OptimizeCSSAssetsPlugin from 'optimize-css-assets-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import NodePolyfillPlugin from 'node-polyfill-webpack-plugin';
import Dotenv from 'dotenv-webpack';
import UglifyJsPlugin from 'uglifyjs-webpack-plugin';
import CompressionWebpackPlugin from 'compression-webpack-plugin';

const COMMON_MODULES = [
  'react',
  'react-dom',
  'react-router',
  'redux',
  'react-redux',
  'redux-thunk',
  'redux-logger',
  'lodash',
  'moment',
  'axios',
  'core-js',
  'react-icons/bs',
  'react-icons/ai'
];

const COMMON_REGEX = `[\\\\/]node_modules[\\\\/](${COMMON_MODULES.join('|')})[\\\\/]`;

const config = {
  entry: path.resolve(__dirname, './src/index.js'),
  mode: 'production',
  devtool: 'source-map',
  output: {
    filename: '[name].[fullhash].js',
    path: path.resolve(__dirname, './dist'),
    publicPath: '/'
  },
  module: {
    rules: [
      {
        test: /\.js|jsx$/,
        exclude: /(node_modules)/,
        loader: 'babel-loader'
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader']
      },
      {
        test: /\.(png|gif|jpe?g|svg|ico)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'images/[name].[ext]'
            }
          }
        ]
      },
      {
        test: /\.html$/,
        use: 'html-loader'
      },
      {
        test: /\.(txt|csv|mmdb|xlsx)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[path][name].[ext]',
              emitFile: true
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: './public/index.html',
      favicon: './public/eo_favicon.png'
    }),
    new MiniCssExtractPlugin({
      filename: '[name].[fullhash].css',
      chunkFilename: '[id].[fullhash].css'
    }),
    new NodePolyfillPlugin(),
    new Dotenv({
      path: './.env.staging'
    }),
    new webpack.IgnorePlugin({
      resourceRegExp: /^\.\/locale$/,
      contextRegExp: /moment$/
    }),
    new CompressionWebpackPlugin({
      algorithm: 'gzip' // or 'brotli'
    })
  ],
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: new RegExp(COMMON_REGEX),
          name: 'vendor',
          chunks: 'all'
        }
      }
    },
    minimizer: [
      new TerserPlugin(),
      new OptimizeCSSAssetsPlugin({}),
      new UglifyJsPlugin()
    ]
  },
  performance: {
    hints: false
  }
};

export default config;
