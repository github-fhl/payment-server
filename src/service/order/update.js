const
  {helperPath, modelPath, cfg, flowCfg} = require('config'),
  {models, sequelize} = require(modelPath),
  {addUsr, updateUsr} = require(helperPath).common,
  {currency, orderType, operate} = cfg,
  {toSubmit, refusedByManager, refusedByCashier, refusedByIC, refusedByFinance, refusedByChief, paySucceed} = flowCfg.orderStatus,
  NP = require('number-precision'),
  {OrderMachine} = require('../orderStateMachine/orderMachine'),
  {ExpenseMachine} = require('../expenseStateMachine/expenseMachine'),
  operateDetail = require('../orderDetail/operateDetail')
/**
 * 编辑 order
 * 1. 检测 order 数据
 * 2. 更新 order 信息
 * 3. 删除所有 orderDetail 信息
 * 4. 一条条创建 orderdetail 数据
 * 5. 执行审批流
 *
 * @return {Promise.<void>}
 */

async function update (args, orderdetails, user, t) {
  let $order = await models.order.findByPrimary(args.id, {transaction: t})
  let order = formateOrder(args, $order, user)

  await check(order, $order, t)

  orderdetails.forEach(orderdetail => {
    order.amount = NP.plus(order.amount, orderdetail.money)
    formateOrderDetail(orderdetail, order.id)
  })

  await $order.update(order, {transaction: t})

  await models.orderdetail.destroy({
    transaction: t,
    where: {orderId: $order.id}
  })

  for (let orderdetail of orderdetails) {
    await operateDetail(orderdetail, user, t)
  }

  await machineOperation($order.id, args.isSubmit, user, t)
  return $order
}

module.exports = update


/**
 * 格式化 order 数据
 * return
 *  - id
 *  - description
 *  - vendorType
 *  - remark
 *  - companyId
 *  - currency
 *  - orderType
 *  - applyDate
 *  - amount
 *  - approStatus
 *  - updatedUsr
 */

function formateOrder (args, $order, user) {
  let fields = ['id', 'description', 'vendorType', 'remark', 'companyId', 'currency']
  let order = {
    amount: 0,
  }
  updateUsr(order, user)

  fields.forEach(field => order[field] = args[field])

  if ($order.orderType !== orderType.Expense) {
    order.orderType = args.currency === currency.CNY ? orderType.Payment : orderType.OverseasPayment
  }
  return order
}

/**
 * 格式化 orderdetail 数据
 * 1. 添加 operate = create
 * 2. 添加 orderId
 * @param orderdetail
 */

function formateOrderDetail (orderdetail, orderId) {
  orderdetail.operate = operate.create
  orderdetail.orderId = orderId
}

/**
 * 审批流操作
 * 1. 判断 isSubmit
 * 2. true => 执行提交操作
 * 3. 判断 orderType，如果是 Expense 走 Expense 的审批流
 */
async function machineOperation (orderId, isSubmit, user, t) {
  if (isSubmit) {
    let $order = await models.order.findByPrimary(orderId, {
      transaction: t,
      include: [{
        model: models.orderdetail,
        where: {status: 1}
      }]
    })

    let machine

    switch ($order.orderType) {
      case orderType.Expense:
        machine = await (new ExpenseMachine($order, user, t)).init()
        break
      default:
        machine = await (new OrderMachine($order, user, {}, t)).init()
    }
    await machine.submit()
  }
}

/**
 * 检测 编辑 order
 * 1. 描述不可重复
 * 2. order 的状态
 * 3. expense 的 currency 不能变更为 USD
 */
async function check (order, $order, t) {

  // 验证 描述 的重复性
  if (order.description){
    let checkDescription = await models.order.count({
      where: {description: order.description, id: {$ne: order.id}},
      transaction: t
    });
    if (checkDescription !== 0) throw new Error('描述重复');
  }

  let allowStatus = [toSubmit, refusedByManager, refusedByCashier, refusedByIC, refusedByFinance, refusedByChief, paySucceed]

  if (!allowStatus.includes($order.approStatus)) throw new Error(`${$order.approStatus} 状态不允许编辑`)

  if ($order.orderType === orderType.Expense && order.currency !== currency.CNY) {
    throw new Error(`${orderType.Expense} 只能选择 CNY`)
  }
}
