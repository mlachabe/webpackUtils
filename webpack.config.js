const path = require('path')
const UglifyJSPluging = require('uglifyjs-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const ManifestPlugin = require('webpack-manifest-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const dev = process.env.NODE_ENV === 'dev'

let cssLoader = [
  { loader: 'css-loader', options: { importLoaders: 1, minimize: !dev } }
]

if (!dev) {
  cssLoader.push(
    { loader: 'postcss-loader',
      options: {
        plugins: (loader) => [
          require('autoprefixer')({
            browsers: ['last 2 versions', 'safari >= 7', 'ie >= 8']
          })
        ]
      }
    }
  )
}

let config = {
  entry: {
    app: ['./assets/css/app.scss', './assets/js/app.js']
  },
  watch: dev,
  output: {
    path: path.resolve('./public/assets'),
    filename: dev ? '[name].js' : '[name].[chunkhash:8].js',
    publicPath: '/assets/'
  },
  resolve: {
    alias: {
      '@css': path.resolve(__dirname, './assets/css/'),
      '@': path.resolve(__dirname, './assets/js/'),
      Templates: path.resolve(__dirname, 'src/templates/')
    }
  },
  devtool: dev ? 'cheap-module-eval-source-map' : false,
  devServer: {
    overlay: true,
    proxy: {
      '/': {
        target: 'http://localhost:8080',
        pathRewrite: {'/': '/assets/'}
      }
    },
    contentBase: path.resolve('./public'),
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization'
    }
  },
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: ['eslint-loader']
      },
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: ['babel-loader']
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: cssLoader
        })
      },
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [...cssLoader, 'sass-loader']
        })
      },
      {
        test: /\.(woff2?|eot|ttf|otf)$/,
        loader: 'filee-loader'
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192,
              name: '[name].[hash:7].[ext]'
            }
          },
          {
            loader: 'img-loader',
            options: {
              enabled: !dev
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new ExtractTextPlugin({
      filename: dev ? '[name].css' : '[name].[contenthash:8].css',
      disable: dev
    }),
    new CleanWebpackPlugin(['public/assets'], {
      root: path.resolve('./'),
      verbose: true,
      dry: false
    }),
    new HtmlWebpackPlugin()
  ]
}

if (!dev) {
  config.plugins.push(new UglifyJSPluging({
    sourceMap: false
  }))
  config.plugins.push(new ManifestPlugin())
}

module.exports = config
