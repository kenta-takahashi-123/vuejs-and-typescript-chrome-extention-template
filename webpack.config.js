const path = require('path');
const webpack = require('webpack');
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const {cssLoaders, htmlPage, styleLoaders} = require('./build/tools');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const ZipPlugin = require('zip-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const rootDir = path.resolve(__dirname, '.');
let resolve = (dir) => path.join(rootDir, 'src', dir);

module.exports = (env, argv) => {
  console.log('webpack mode: ' + argv.mode);
  const isProduction = argv.mode !== 'development';

  let rules = styleLoaders({extract: isProduction, sourceMap: isProduction}).concat([
    {
      test: /\.vue$/,
      loader: 'vue-loader',
      options: {
        extractCSS: true,
        loaders: {
          ...cssLoaders(),
          js: {loader: 'ts-loader'}
        },
        transformToRequire: {
          video: 'src',
          source: 'src',
          img: 'src',
          image: 'xlink:href'
        },
        optimization: {
          noEmitOnErrors: true
        }
      }
    },
    {
      test: /\.ts$/,
      loader: 'ts-loader',
      include: [
        path.join(rootDir, 'src'),
        // https://github.com/sagalbot/vue-select/issues/71#issuecomment-229453096
        path.join(rootDir, 'node_modules', 'element-ui', 'src', 'utils')
      ]
    },
    {
      test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
      loader: 'url-loader',
      options: {
        limit: 10000,
        name: 'fonts/[name].[hash:7].[ext]'
      }
    }
  ]);

  let plugins = [
    new VueLoaderPlugin(),
    new CleanWebpackPlugin(),
    // Customize your extension structure.
    htmlPage('home', 'app', ['manifest', 'vendor', 'tab']),
    htmlPage('popup', 'popup', ['manifest', 'vendor', 'popup']),
    htmlPage('options', 'options', ['manifest', 'vendor', 'options']),
    htmlPage('background', 'background', ['manifest', 'vendor', 'background']),
    // End customize
    new CopyWebpackPlugin([
      {from: path.join(rootDir, 'static')}
    ])
  ].concat(isProduction
      ? [
        new MiniCssExtractPlugin({filename: 'css/[name].css'}),
        new webpack.HashedModuleIdsPlugin(),
        new ZipPlugin({
          path: '..',
          filename: 'extension.zip'
        })
      ]
      : [
        new FriendlyErrorsPlugin()
      ]
  );

  return {
    entry: {
      popup: resolve('./popup'),
      tab: resolve('./tab'),
      options: resolve('./options'),
      content: resolve('./content'),
      background: resolve('./background')
    },
    output: {
      path: path.join(rootDir, 'dist'),
      publicPath: '/',
      filename: 'js/[name].js',
      chunkFilename: 'js/[id].[name].js?[hash]',
      library: '[name]'
    },
    resolve: {
      extensions: ['.ts', '.js', '.vue', '.json'],
      alias: {
        'vue$': 'vue/dist/vue.esm.js',
        '@': resolve('src')
      }
    },
    module: {
      rules: rules
    },
    plugins: plugins,
    performance: {hints: false},
    devtool: isProduction ? false : '#cheap-module-source-map',
  }
};
