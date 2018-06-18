const
  {helperPath, modelPath, cfg} = require('config'),
  {validate, success, fail} = require(helperPath),
  {models, sequelize} = require(modelPath),
  {update, get} = require('../../service/order')

module.exports = (req, res) => {
  const rule = getRule(req)

  let args = validate(res, rule, req.params, req.body)
  if (!args) return

  async function run (t) {
    let $order = await update(args, args.details, req.user, t)
    $order = await get({id: $order.id}, t)

    return {order: $order}
  }

  sequelize.transaction(t => run(t))
    .then(success(res, true)).catch(fail(res))
}

function getRule (req) {
  let rule = {
    isSubmit: {type: 'boolean', required: false},
    id: 'string',
    description: 'string',
    vendorType: 'string',
    remark: {type: 'string', required: false, allowEmpty: true},
    companyId: 'string',
    currency: 'string',
    details: {
      type: 'array',
      required: true,
      itemType: 'object',
      rule: {
        money: 'number',
        payDate: 'string',
        bankNum: 'string',
        bankName: 'string',
        paytypeId: 'string',
        paytypedetailId: {type: 'string', required: false, allowEmpty: true},
        reimuserId: 'string',
        vendorName: 'string',
        contacter: {type: 'string', required: false, allowEmpty: true},
        telphone: {type: 'string', required: false, allowEmpty: true},
        remark: {type: 'string', required: false, allowEmpty: true},
        companyId: 'string'
      }
    }
  }

  if (req.body.currency !== cfg.currency.CNY) {
    rule.details.rule = {
      ...rule.details.rule,
      bankAddress: 'string',
      bankCodeType: {type: 'enum', values: Object.values(cfg.bankCodeType), required: true},
      bankCode: 'string',
      country: 'string',
    }
  }

  return rule
}
