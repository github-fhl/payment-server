const
  {list, create, detail, remove, update, changeIndex, getCommonId} = require('../controller/bankStatement')

module.exports = (router, rbac) => {

  router.route('/bankStatement')
    .get(list)
    .post(create)

  router.route('/bankStatement/:id')
    .get(detail)
    .delete(remove)
    .put(update)

  router.route('/changeIndex')
    .put(changeIndex)

  router.route('/commonId')
    .get(getCommonId)
}

