const {personOrderRecords, getPayType} = require('../controller/statistic')

module.exports = (router, rbac) => {
  router.route('/statistics/reimusers')
    .post(personOrderRecords)
    .get(getPayType)
}