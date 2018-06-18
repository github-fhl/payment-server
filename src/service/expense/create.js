const
  {modelPath, cfg, helperPath} = require('config'),
  {vendorType} = cfg,
  {addUsr} = require(helperPath).common,
  {models} = require(modelPath),
  {ExpenseMachine} = require('../expenseStateMachine'),
  vendor = require('../vendor')

/**
 * 创建报销申请单
 * 1. 创建 order
 * 2. 创建 orderDetail
 * 3. 创建 vendor/vendorDetail
 * 4. 变更 order 状态
 */

module.exports = async (expense, user, t) => {
  addUsr(expense, user)
  let $expense = await models.order.create(expense, {transaction: t})

  let details = []
  addUsr(expense, user)

  for (let expenseDetail of expense.expenseDetails) {

    let vendorDate = {
      name: expenseDetail.vendorName,
      vendorType: vendorType.user,
      code: 'A000'
    }
    let $vendor = await vendor.create(vendorDate, user, t)

    expenseDetail.vendorId = $vendor.id

    let vendordetailDate = {
      bankNum: expenseDetail.bankNum,
      vendorId: expenseDetail.vendorId,
      bankName: expenseDetail.bankName
    }
    await vendor.createDetail(vendordetailDate, user, t)
  }

  details = [...details, ...expense.expenseDetails]

  await models.orderdetail.bulkCreate(details, {transaction: t})

  let machine = await (new ExpenseMachine($expense, user, t)).init()

  await machine.create()
}
