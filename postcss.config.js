const autoprefixer = require('autoprefixer');
const precss = require('precss');

module.exports = {
  plugins: [
    autoprefixer({
      browsers: 'ie >= 10, firefox >= 11, chrome >= 15, safari >= 7, opera >= 12.1'
    })
  ]
};
