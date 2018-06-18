const
  {list, create, getPreInfo, detail, update, print, download} = require('../controller/voucher')

module.exports = (router, rbac) => {

  router.route('/voucher')
    .get(list)
    .post(create)

  router.route('/voucher/:id')
    .get(detail)
    .put(update)

  router.route('/printVoucher/:id')
    .get(print)

  router.route('/downloadVoucher/:id')
    .get(download)

  router.route('/preVoucherInfo')
    .get(getPreInfo)
}

