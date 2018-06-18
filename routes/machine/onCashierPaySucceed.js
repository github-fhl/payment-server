const
  {modelPath} = require('config'),
  {models} = require(modelPath)

/**
 * 付款完成时，创建对应的 ordersubject
 */

async function onCashierPaySucceed (action, t) {
  //todo 参数传递
  let $order = await models.order.findByPrimary(this.order.id, {
    transaction: t,
    include: [{
      model: models.orderdetail,
      where: {status: 1}
    }]
  })

}
module.exports = onCashierPaySucceed
