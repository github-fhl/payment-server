const
  {create} = require('../controller/expense'),
  {handler} = require('../controller/handleStateMachine')

module.exports = (router, rbac) => {
  router.route('/expenses')
    .post(create)

  router.route('/expenses/stateMachine/:handle')
    .put(handler)
}
