const {helperPath} = require('config')
const {success, fail} = require(helperPath);
const {setupSummary} = require('../../service/setup')
module.exports = async (req, res) => {
    let run = async () => {
        return await setupSummary();
    }
    run().then(success(res)).catch(fail(res));
}