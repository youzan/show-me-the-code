const autoprefixer = require('autoprefixer');
const precss = require('precss');

module.exports = {
  plugins: [
    autoprefixer({
      browsers: 'electron >= 1.6'
    }),
    precss
  ]
};
