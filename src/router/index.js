const
  {helperPath} = require('config'),
  {getAPIs} = require(helperPath).sys,
  r = getAPIs(__dirname)

module.exports = (router, rbac) => {

  for (let fileName in r) {
    r[fileName](router, rbac)
  }
}
