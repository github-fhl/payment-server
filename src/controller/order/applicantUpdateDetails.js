const
  {helperPath, modelPath, cfg} = require('config'),
  {validate, success, fail} = require(helperPath),
  {models, sequelize} = require(modelPath),
  {formateApplicantUpdateDetail, updateDetails} = require('../../service/orderDetail'),
  {OrderMachine} = require('../../service/orderStateMachine'),
  {ExpenseMachine} = require('../../service/expenseStateMachine')

module.exports = (req, res) => {
  const rule = {
    id: 'string',
    isSubmit: {type: 'boolean', required: false},
    rejectRemark: {type: 'string', required: false, allowEmpty: true},
    details: {
      type: 'array',
      required: true,
      itemType: 'object',
      rule: {
        orderdetailId: 'string',
        bankNum: 'string',
        bankName: 'string',
        vendorName: 'string',
        operate: 'string'
      }
    }
  }
  let args = validate(res, rule, req.params, req.body)
  if (!args) return

  async function run (t) {
    let orderdetails = await formateApplicantUpdateDetail(args.details, t)
    await updateDetails(orderdetails, args.id, req.user, t)

    if (args.isSubmit) {
      let $order = await models.order.findByPrimary(args.id, {
        transaction: t,
        include: [{
          model: models.orderdetail,
          where: {status: 1}
        }]
      })

      let machine

      switch ($order.orderType) {
        case cfg.orderType.Expense:
          machine = await (new ExpenseMachine($order, req.user, t, args)).init()
          break
        default:
          machine = await (new OrderMachine($order, req.user, args, t)).init()
      }

      await machine.applicantUpdate()
    }
  }

  sequelize.transaction(t => run(t))
    .then(success(res)).catch(fail(res))
}
