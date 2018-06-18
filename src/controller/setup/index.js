const
  {helperPath} = require('config'),
  {getAPIs} = require(helperPath).sys

module.exports = getAPIs(__dirname)
