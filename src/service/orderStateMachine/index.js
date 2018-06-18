const
  {OrderMachine} = require('./orderMachine'),
  {modelPath} = require('config'),
  {models} = require(modelPath)

/**
 * 对 order 的审批操作进行处理
 * id
 * args
 *  - handle
 *  - remark
 */
async function flow (id, args, user, t) {
  let $order = await models.order.findByPrimary(id, {
    transaction: t,
    include: [{
      model: models.orderdetail,
      where: {status: 1}
    }]
  })
  let machine = await (new OrderMachine($order, user, args, t)).init()

  await machine[args.handle]()
}

module.exports = {
  OrderMachine,
  flow
}
