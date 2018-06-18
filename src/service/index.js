const config = require('config');
const helper = require(config.helperPath);

module.exports = helper.sys.getAPIs(__dirname);
