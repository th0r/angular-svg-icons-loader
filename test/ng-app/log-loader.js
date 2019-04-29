const {getOptions} = require('loader-utils');

module.exports = function (content) {
  const opts = getOptions(this);
  if (!opts.filter || opts.filter.test(this.request)) {
    console.log(`--- ${opts.id} ---\n\n`, content);
  }
  return content;
};
