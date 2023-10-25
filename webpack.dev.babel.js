import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import NodePolyfillPlugin from 'node-polyfill-webpack-plugin';
import Dotenv from 'dotenv-webpack';

const config = {
  entry: path.resolve(__dirname, './src/index.js'),
  mode: 'development',
  devtool: 'source-map',
  output: {
    filename: '[name].[fullhash].js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
    pathinfo: false
  },
  module: {
    rules: [{
      test: /\.js|jsx$/,
      exclude: /(node_modules)/,
      loader: 'babel-loader'
    }, {
      test: /\.jsx?$/,
      include: /node_modules/,
      use: ['react-hot-loader/webpack']
    }, {
      test: /\.(le|c)ss$/,
      use: [
        {
          loader: MiniCssExtractPlugin.loader
        },
        'css-loader'
      ]
    }, {
      test: /\.(png|gif|jpe?g|svg|ico)$/,
      use: [{
        loader: 'file-loader',
        options: {
          name: 'images/[name].[ext]'
        }
      }]
    }, {
      test: /\.html$/,
      use: [{
        loader: 'html-loader'
      }]
    }, {
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
    }]
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: './public/index.html',
      favicon: './public/eo_favicon.png'
    }),
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css'
    }),
    new NodePolyfillPlugin(),
    new Dotenv({
      path: './.env.dev'
    })
  ],
  devServer: {
    port: 3000,
    historyApiFallback: true
  },
  performance: {
    hints: false
  }
};

export default config;
