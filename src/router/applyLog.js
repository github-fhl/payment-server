const
  {getLogNum} = require('../controller/applyLog')

module.exports = (router, rbac) => {
  router.route('/applyLogs/:id')
    .get(getLogNum)
}
