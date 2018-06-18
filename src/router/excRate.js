const
  {get, createUpdate} = require('../controller/excRate')

module.exports = (router, rbac) => {

  router.route('/excRate')
    .get(get)
    .post(createUpdate)
}
