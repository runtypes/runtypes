const path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/index.ts',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /.*\.spec\..*/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts'],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'runtypes.js',
  },
  devtool: 'source-map',
};
