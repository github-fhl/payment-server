const
  {helperPath, modelPath, flowCfg, cfg} = require('config'),
  {orderType} = cfg,
  {sequelize, models} = require(modelPath),
  {validate, success, fail} = require(helperPath),
  {
    managerRefuse, cashierRefuse, financeRefuse, chiefRefuse, cashierPayFailed, cashierPay, cashierPaySucceed, icRefuse,
    cashierAppro, cashierApproToIC
  } = flowCfg.orderOperation,
  expenseFlow = require('../../service/expenseStateMachine').flow,
  orderStateMachine = require('../../service/orderStateMachine'),
  orderFlow = orderStateMachine.flow


/**
 * 中转不同的审批流
 * 1. Payment 的 order，使用 orderFlow
 * 2. OverseasPayment 的 order，使用 orderFlow
 *    1. 如果状态是 cashierAppro => cashierApproToIC
 * 3. Expense 的 order，使用 expenseFlow
 */

function handler (req, res) {

  const rule = getRule(req.params.handle)
  let args = validate(res, rule, req.body, req.params)
  if (!args) return

  async function run (t) {

    args.remark = args.rejectRemark

    for (let id of args.idArr) {
      let $order = await models.order.findByPrimary(id, {transaction: t})

      switch ($order.orderType) {
        case orderType.Payment:
          await orderFlow(id, args, req.user, t)
          break
        case orderType.OverseasPayment:
          if (args.handle === cashierAppro) args.handle = cashierApproToIC

          await orderFlow(id, args, req.user, t)
          break
        case orderType.Expense:
          await expenseFlow(id, args, req.user, t)
          break
      }
    }
  }

  sequelize.transaction(t => run(t))
    .then(success(res)).catch(fail(res))
}

exports.handler = handler

function getRule (handle) {

  let rule = {
    idArr: 'array',
    handle: 'string',
    rejectRemark: {type: 'string', required: false, allowEmpty: true}
  }

  if (handle === cashierPay) {
    rule = {
      ...rule,
      paidDate: 'string',
      subjectId: 'string'
    }
  }
  if ([managerRefuse, cashierRefuse, financeRefuse, chiefRefuse, cashierPayFailed, icRefuse].includes(handle)) {
    rule.rejectRemark = {type: 'string', required: true}
  }

  if (handle === cashierPaySucceed) {
    rule.amountCNY = {type: 'object', required: false}
    rule.bankCharge = 'object'
  }

  return rule
}
