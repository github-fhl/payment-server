const
  {modelPath, cfg} = require('config'),
  {models} = require(modelPath),
  {orderType} = cfg,
  {OrderMachine} = require('../orderStateMachine/orderMachine'),
  {ExpenseMachine} = require('../expenseStateMachine/expenseMachine')

module.exports = async (args, user, t) => {
  let $order = await models.order.findByPrimary(args.id, {
    transaction: t
  })

  let machine

  switch ($order.orderType) {
    case orderType.Expense:
      machine = await (new ExpenseMachine($order, user, t)).init()
      break
    default:
      machine = await (new OrderMachine($order, user, {}, t)).init()
  }

  await machine.abandon()
}
