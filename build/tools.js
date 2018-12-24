const {resolve} = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');

exports.htmlPage = (title, filename, chunks, template) => new HtmlWebpackPlugin({
  title,
  hash: true,
  cache: true,
  inject: 'body',
  filename: './pages/' + filename + '.html',
  template: template || resolve(__dirname, './page.ejs'),
  appMountId: 'app',
  chunks
});

exports.cssLoaders = (options = {}) => {
  let loaders = {};
  let prePprocessors = {
    css: {},
    postcss: {},
    scss: {loader: 'sass'},
  };
  for (let key in prePprocessors) {
    let loader = [{
      loader: 'css-loader'
    }];
    if (prePprocessors[key].loader) {
      loader.push({
        loader: prePprocessors[key].loader + '-loader',
        options: Object.assign({}, prePprocessors[key].options, {sourceMap: options.sourceMap})
      })
    }
    if (options.extract) {
      loaders[key] = [MiniCssExtractPlugin.loader].concat(loader)
    } else {
      loaders[key] = ['vue-style-loader'].concat(loader)
    }
  }
  return loaders
};

exports.styleLoaders = function (options) {
  const output = [];
  const loaders = exports.cssLoaders(options);
  for (const extension in loaders) if (loaders.hasOwnProperty(extension)) {
    const loader = loaders[extension];
    output.push({
      test: new RegExp('\\.' + extension + '$'),
      use: loader
    })
  }
  return output
};
