const
  NP = require('number-precision'),
  {modelPath, cfg, flowCfg} = require('config'),
  {publicCost, others} = cfg,
  {abandoned} = flowCfg.orderStatus,
  {models} = require(modelPath),
  moment = require('moment')

/**
 * 获取 Reimuser 某种费用类型剩余的金额
 * 1. 判断是 paytype 还是 paytypedetail
 * 2. 查找对应月份，该费用类型的限额
 * 3. 查找该员工对应已经使用了多少钱，对于报销类型的 order 中不计入统计
 * 4. 返回剩余金额
 * 5. 如果是保存 payment 的情况，那么需要排除掉当前的订单
 *
 * @param reimuserId
 * @param validDate
 * @param paytypeId
 * @param paytypedetailId
 * @param orderType
 * @param t
 * @return
 *    - budget
 *    - cost
 *    - rest
 *    - vendorName
 *    - bankName
 *    - bankNum
 */

//todo 需要再获取额度时，考虑对应的情况

module.exports = async (reimuserId, validDate, paytypeId, paytypedetailId, orderType=cfg.orderType.Payment, t) => {
  if (!paytypeId && !paytypedetailId) throw new Error('需要费用类型')

  let
    costKey = paytypedetailId ? 'paytypedetailId' : 'paytypeId',
    costId = paytypedetailId || paytypeId

  let {budget, vendorName, bankName, bankNum} = await getBudget(reimuserId, validDate, costKey, costId, orderType, t)
  let cost = await getCost(reimuserId, costKey, costId, validDate, t)

  return {
    budget,
    cost,
    rest: NP.minus(budget, cost),
    vendorName, bankName, bankNum
  }
}

/**
 * 获取成本中心的预算
 * 1. 如果 reimuser 是 publicCost, others，则预算无限大
 * 2. 如果 orderType 是 Expense
 */

async function getBudget (reimuserId, validDate, costKey, costId, orderType, t) {

  let $reimuser = await models.reimuser.findByPrimary(reimuserId, {transaction: t})
  let $reimuserdetail = await models.reimuserdetail.findOne({
    transaction: t,
    where: {
      reimuserId,
      [costKey]: costId,
      validDate: {$lte: validDate},
      status: 1
    },
    order: [['validDate', 'DESC']],
    include: [{
      model: models.vendordetail,
      include: [{
        model: models.vendor,
      }]
    }]
  })

  if ([publicCost, others].includes($reimuser.name)) {
    return {
      budget: 10000000000
    }
  }

  if (orderType === cfg.orderType.Expense) {
    if (!$reimuserdetail) return {budget: 10000000000}

    return {
      budget: 10000000000,
      vendorName: $reimuserdetail.vendordetail.vendor.name,
      bankName: $reimuserdetail.vendordetail.bankName,
      bankNum: $reimuserdetail.vendordetail.bankNum,
    }
  }

  if (!$reimuserdetail) {
    throw new Error(`员工 ${$reimuser.name} 在 ${validDate} 不存在 ${costId} 的报销额度`)
  }

  return {
    budget: $reimuserdetail.money,
    vendorName: $reimuserdetail.vendordetail.vendor.name,
    bankName: $reimuserdetail.vendordetail.bankName,
    bankNum: $reimuserdetail.vendordetail.bankNum,
  }
}

async function getCost (reimuserId, costKey, costId, validDate, t) {
  let payDate = moment(validDate).format('YYYY-MM')

  let $orderdetails = await models.orderdetail.findAll({
    transaction: t,
    where: {
      reimuserId,
      [costKey]: costId,
      status: 1,
      payDate
    },
    include: [{
      model: models.order,
      where: {
        orderType: {$in: [cfg.orderType.Payment]},
        approStatus: {$ne: abandoned},
      },
      attributes: ['orderType']
    }]
  })

  let cost = 0

  $orderdetails.forEach(orderdetail => cost = NP.plus(cost, orderdetail.money))

  return cost
}
