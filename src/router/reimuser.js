const
  {getRest} = require('../controller/reimuser')

module.exports = (router, rbac) => {
  router.route('/v2/reimusers/getRest')
    .get(getRest)

}
