const pathLib = require("path"),
  htmlWebpackPlugin = require("html-webpack-plugin"),
  origin = "http://36.110.36.118:19180",
  { VueLoaderPlugin } = require("vue-loader");
module.exports = {
  mode: "development",
  devtool: "source-map",
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          name: "vendor",
          chunks: "initial",
          priority: 1,
          test: /node_modules\/(.*)\.js$/
        }
      }
    }
  },
  entry: {
    index: pathLib.resolve(__dirname, "./src/index.js")
  },
  output: {
    path: pathLib.resolve(__dirname, "./html"),
    filename: "[name].js"
  },
  plugins: [
    new htmlWebpackPlugin({
      template: "./src/index.html",
      hash: true
    }),
    new VueLoaderPlugin()
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        use: "babel-loader"
      },
      {
        test: /\.vue$/,
        use: "vue-loader"
      },
      {
        test: /\.less$/,
        use: ["style-loader", "css-loader", "less-loader"]
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      }
    ]
  },
  devServer: {
    open: true,
    openPage: "./index.html",
    contentBase: "./",
    proxy: {
      "/api": {
        target: origin,
        security: false,
        changeOrigin: true
      },
      "/upload": {
        target: origin,
        security: false,
        changeOrigin: true
      }
    }
  }
};
