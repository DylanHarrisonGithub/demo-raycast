const path = require('path');

module.exports = {
  mode: "production",
  //devtool: "inline-source-map",   // enable for debugging while developing
  entry: {
    main: "./ts/index.ts",
  },
  output: {
    path: path.resolve(__dirname, '../'),
    filename: "index.js" // <--- Will be compiled to this single file
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
  },
  module: {
    rules: [
      { 
        test: /\.tsx?$/,
        loader: "ts-loader"
      }
    ]
  }
};
