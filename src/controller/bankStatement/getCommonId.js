const
  {helperPath, cfg} = require('config'),
  {validate, success, fail} = require(helperPath),
  {getCommonId} = require('../../service/bankStatement');

module.exports = (req, res) => {
  const rule = {
    transactionType: {type: 'enum', values: Object.values(cfg.transactionType), required: true},
    subjectId: {type: 'string', required: false},
    mark: {type: 'string', required: true}
  }

  let args = validate(res, rule, req.query);
  if (!args) return;

  async function run() {
    return await getCommonId(args);
  }

  run().then(success(res)).catch(fail(res));
}