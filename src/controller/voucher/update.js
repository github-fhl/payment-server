const
  {helperPath, modelPath} = require('config'),
  {sequelize} = require(modelPath),
  {validate, success, fail} = require(helperPath),
  {update, detail} = require('../../service/voucher');

module.exports = (req, res) => {
  const rule = {
    id: {type: 'string', required: true},
    voucherDate: {type: 'date', required: true},
    companyId: {type: 'string', required: true},
    remark: {type: 'string', required: false, allowEmpty: true},
    voucherDetails: {
      type: 'array',
      required: true,
      rule: {
        money: {type: 'number', required: true},
        remark: {type: 'string', required: false, allowEmpty: true},
        bankFlag: {type: 'string', required: true},
        type: {type: 'string', required: true},
        subjectId: {type: 'string', required: true}
      }
    }
  }

  let args = validate(res, rule, req.params, req.body);
  if (!args) return;

  async function run(t) {
    await update(args, req.user, t);
    return await detail(args, t);
  }

  sequelize.transaction(t => run(t)).then(success(res)).catch(fail(res));
}