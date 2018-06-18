const
  {get, getList, update, create} = require('../controller/receipt')

module.exports = (router, rbac) => {

  router.route('/receipts')
    .get(getList)
    .post(create)

  router.route('/receipts/:id')
    .get(get)
    .put(update)
}
