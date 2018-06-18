const {helperPath} = require('config'),
  {validate, success, fail} = require(helperPath),
  {getPreInfo} = require('../../service/voucher')

module.exports = (req, res) => {
  const rule = {
    bankStatementIds: {type: 'string', required: true},
  }
  let args = validate(res, rule, req.query);
  if (!args) return;

  async function run() {
    try {
      args.bankStatementIds = JSON.parse(args.bankStatementIds)
    }
    catch (err) {
      throw new Error('BankStatementIds 需要是 JSON 化后的数组')
    }

    if (args.bankStatementIds.length === 0) throw new Error('至少选择一条银行流水')

    return await getPreInfo(args);
  }

  run().then(success(res)).catch(fail(res));
}
