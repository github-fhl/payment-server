const
  {modelPath, cfg} = require('config'),
  {} = cfg,
  operateDetail = require('./operateDetail'),
  {models} = require(modelPath),
  NP = require('number-precision')

/**
 * 申请人修改申请单信息
 * 1. 传入 details
 *    1. 每条 detail 进行处理
 * 2. 最后汇总 detail 的金额，然后更新 order
 *
 *
 * - orderdetails
 *    - operate
 *    - id
 *    - paytypeId
 *    - paytypedetailId
 *    - money
 *    - companyId
 *    - payDate
 *    - orderId
 *    - reimuserId
 *    - vendorName
 *    - vendorAddress
 *    - payeeType
 *    - bankNum
 *    - bankName
 *    - bankAddress
 *    - bankCodeType
 *    - bankCode
 *    - country
 */

async function updateDetails (orderdetails, orderId, user, t) {
  for (let orderdetail of orderdetails) {
    await operateDetail(orderdetail, user, t)
  }

  let $orderdetails = await models.orderdetail.findAll({
    transaction: t,
    where: {
      orderId,
      status: 1
    }
  })

  let amount = 0

  $orderdetails.forEach($orderdetail => amount = NP.plus(amount, $orderdetail.money))

  await models.order.update({amount}, {
    where: {id: orderId},
    transaction: t
  })
}
module.exports = updateDetails
