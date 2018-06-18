const
  {init} = require('../controller/init')

module.exports = (router, rbac) => {
  router.route('/v2/initPayment')
    .get(init)
}
