const
  {modelPath, cfg} = require('config'),
  {operate} = cfg,
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
 * get
 * - orderdetails
 *    - orderdetailId
 *    - operate
 *    - bankNum
 *    - bankName
 *
 * return
 * - orderdetails
 *    - operate
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

async function formateApplicantUpdateDetail (orderdetails, t) {
  let formateOrderDetails = []

  for (let orderdetail of orderdetails) {
    if (orderdetail.operate === operate.create) throw new Error('只能编辑与删除')

    let $orderdetail = await models.orderdetail.findByPrimary(orderdetail.orderdetailId, {
      transaction: t,
      attributes: ['id', 'paytypeId', 'paytypedetailId', 'money', 'companyId', 'payDate', 'orderId', 'reimuserId', 'vendorAddress', 'payeeType', 'bankNum', 'bankName', 'bankAddress', 'bankCodeType', 'bankCode', 'country']
    })

    delete orderdetail.orderdetailId
    formateOrderDetails.push({
      ...$orderdetail.dataValues,
      ...orderdetail
    })
  }

  return formateOrderDetails
}
module.exports = formateApplicantUpdateDetail
