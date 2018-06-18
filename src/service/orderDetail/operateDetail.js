const
  {modelPath, cfg} = require('config'),
  {operate, vendorType, publicCost, others, orderType} = cfg,
  {models} = require(modelPath),
  {getRest} = require('../reimuser/index'),
  vendor = require('../vendor/index')

/**
 * 处理 orderdetail
 * 1. 判断 operate 值
 *    1. create
 *    2. delete：将数据 status=0
 *    3. update：将原数据 delete ，再 create
 * 2. 获取 reimuser、费用类别、payDate 对应的剩余金额
 * 3. 如果 money 大于剩余金额，则报错
 * 4. 创建 vendor/vendorDetail
 *
 * - orderdetail
 *    - id
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

async function operateDetail (orderdetail, user, t) {
  switch (orderdetail.operate) {
    case operate.create:
      await createDetail(orderdetail, user, t)
      break
    case operate.delete:
      await deleteDetail(orderdetail, user, t)
      break
    case operate.update:
      await updateDetail(orderdetail, user, t)
  }
}
module.exports = operateDetail

/**
 * 创建 orderdetail
 * 1. 获取 reimuser、费用类别、payDate 对应的剩余金额
 * 2. 当是 payment 时，如果 money 大于剩余金额，则报错
 * 3. 创建 vendor/vendorDetail
 * 4. 更新 reimuser 对应的 vendordetailId
 */

async function createDetail (orderdetail, user, t) {
  delete orderdetail.id

  let $order = await models.order.findByPrimary(orderdetail.orderId, {transaction: t})

  if ($order.orderType === orderType.Payment) {
    let {rest} = await getRest(orderdetail.reimuserId, orderdetail.payDate, orderdetail.paytypeId, orderdetail.paytypedetailId, null, t)

    if (orderdetail.money > rest) {
      let $reimuser = await models.reimuser.findByPrimary(orderdetail.reimuserId, {transaction: t})
      throw new Error(`${$reimuser.name} 的 ${orderdetail.paytypedetailId || orderdetail.paytypeId} 在 ${orderdetail.payDate} 月份已超额，剩余额度 ${rest}`)
    }
  }

  let vendorDate = {
    name: orderdetail.vendorName,
    vendorType: vendorType.user,
    code: 'A000'
  }
  let $vendor = await vendor.create(vendorDate, user, t)

  orderdetail.vendorId = $vendor.id

  let vendordetailDate = {
    bankNum: orderdetail.bankNum,
    vendorId: orderdetail.vendorId,
    bankName: orderdetail.bankName,
    bankAddress: orderdetail.bankAddress,
    bankCodeType: orderdetail.bankCodeType,
    bankCode: orderdetail.bankCode,
    country: orderdetail.country,
  }
  let $vendorDetail = await vendor.createDetail(vendordetailDate, user, t)

  await updateVendorInfo(orderdetail, $vendorDetail.id, $order, t)

  await models.orderdetail.create(orderdetail, {transaction: t})
}

/**
 * 创建 orderDetail 时，需要更新对应的 reimuser 的 vendor 信息
 * 1. reimuser 不能是 others publicCost
 * 2. order 的 orderType 为 OverseasPayment 时，不更新
 *
 * - orderdetail
 *    - reimuserId
 *    - orderId
 *    - paytypedetailId
 *    - paytypeId
 *    - payDate
 */

async function updateVendorInfo (orderdetail, vendordetailId, $order, t) {
  let $reimuser = await models.reimuser.findByPrimary(orderdetail.reimuserId, {transaction: t})
  if ([publicCost, others].includes($reimuser.name)) return

  if ($order.orderType === orderType.OverseasPayment) return

  let
    costKey = orderdetail.paytypedetailId ? 'paytypedetailId' : 'paytypeId',
    costId = orderdetail.paytypedetailId || orderdetail.paytypeId

  let $reimuserdetail = await models.reimuserdetail.findOne({
    transaction: t,
    where: {
      reimuserId: orderdetail.reimuserId,
      [costKey]: costId,
      validDate: {$lte: orderdetail.payDate},
      status: 1
    },
    order: [['validDate', 'DESC']],
  })

  if ($reimuserdetail) await $reimuserdetail.update({vendordetailId}, {transaction: t})
}



async function deleteDetail (orderdetail, user, t) {
  await models.orderdetail.destroy({
    where: {id: orderdetail.id},
    transaction: t
  })
}

async function updateDetail (orderdetail, user, t) {
  await deleteDetail(orderdetail, user, t)
  await createDetail(orderdetail, user, t)
}
