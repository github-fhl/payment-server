const
  initCompany = require('./initCompany'),
  initPaytype = require('./initPaytype'),
  initReimuser = require('./initReimuser'),
  initSubject = require('./initSubject'),
  initVendor = require('./initVendor')

module.exports = async function (t) {
  await initSubject(t)
  await initPaytype(t)
  await initCompany(t)
  await initVendor(t)
  await initReimuser(t)
}



