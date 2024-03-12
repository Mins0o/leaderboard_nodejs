const path = require('path');

module.exports = {
  entry: './module_loader.js',
  output: {
    path: path.resolve(__dirname, './public'),
    filename: 'module_compilation.js',
  },
};
