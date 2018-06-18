const
  {ExpenseMachine} = require('./expenseMachine'),
  {modelPath} = require('config'),
  {models} = require(modelPath)

/**
 * 对 expense 的审批操作进行处理
 * id
 * args
 *  - handle
 *  - remark
 */
async function flow (id, args, user, t) {
  let $expense = await models.order.findByPrimary(id, {
    transaction: t,
    include: [{
      model: models.orderdetail,
      where: {status: 1}
    }]
  })

  let machine = await (new ExpenseMachine($expense, user, t, args)).init()

  await machine[args.handle]()
}

module.exports = {
  ExpenseMachine,
  flow
}
