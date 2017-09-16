const path = require('path');
const UglifyJSPluging = require('uglifyjs-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const dev = process.env.NODE_ENV === "dev"

let cssLoader = [ 
    { loader: 'css-loader', options: { importLoaders: 1, minimize: !dev } },
  ];

  if(!dev){
      cssLoader.push(
        { loader: 'postcss-loader',
          options: {
            plugins: (loader) => [
              require('autoprefixer')({
                  browsers: ["last 2 versions", "safari >= 7","ie >= 8"]
              }),
            ]
          }
        }
      );
  }


let config = {
    entry: './assets/js/app.js',
    watch: dev,
    output: {
        path: path.resolve('./dist'),
        filename: 'bundle.js',
        publicPath : "dist/"
    },
    devtool: dev ? "cheap-module-eval-source-map" : "source-map",
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: ['babel-loader']
            },
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    fallback: "style-loader",
                    use: cssLoader
                })
            },
            {
                test: /\.scss$/,
                use: ExtractTextPlugin.extract({
                    fallback: "style-loader",
                    use: [...cssLoader, 'sass-loader']
                })
            }
        ]
    },
    plugins: [
        new ExtractTextPlugin({
            filename : '[name].css',
            disable : dev
        })
    ]
}

if(!dev){
    config.plugins.push(new UglifyJSPluging({
        sourceMap: true
    }));
}

module.exports = config;