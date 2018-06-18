const {setupSummary} = require('../controller/setup');
module.exports = (router, rbac) => {
    router.route('/setup/summary')
        .get(setupSummary);
}