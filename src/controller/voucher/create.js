const
  {helperPath, modelPath, cfg} = require('config'),
  {validate, success, fail} = require(helperPath),
  {sequelize} = require(modelPath),
  {create, detail} = require('../../service/voucher');

module.exports = (req, res) => {
  const rule = {
    costType: {type: 'enum', values: Object.values(cfg.costType), required: true},
    voucherDate: {type: 'date', required: true},
    transactionType: {type: 'enum', values: Object.values(cfg.transactionType), required: true},
    vendorId: {type: 'string', required: false, allowEmpty: true},
    companyId: {type: 'string', required: false},
    remark: {type: 'string', required: false, allowEmpty: true},
    voucherDetails: {
      type: 'array',
      required: true,
      min: 2,
      rule: {
        money: {type: 'number', required: true},
        remark: {type: 'string', required: false, allowEmpty: true},
        bankFlag: {type: 'string', required: true},
        type: {type: 'string', required: true},
        subjectId: {type: 'string', required: true}
      }
    },
    bankStatements: {
      type: 'array',
      required: true
    }
  }
  let args = validate(res, rule, req.body);
  if (!args) return

  async function run(t) {
    let obj = await create(args, req.user, t);
    return await detail(obj, t)
  }

  sequelize.transaction(t => run(t)).then(success(res)).catch(fail(res));

}