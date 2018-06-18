const
    {helperPath, modelPath, cfg, flowCfg} = require('config'),
    {models, sequelize} = require(modelPath),
    {currency, orderType, operate} = cfg,
    {orderStatus} = flowCfg,
    NP = require('number-precision'),
    moment = require('moment'),
    generatorId = require('./generatorId'),
    {OrderMachine} = require('../orderStateMachine/orderMachine'),
    {ExpenseMachine} = require('../expenseStateMachine/expenseMachine'),
    operateDetail = require('../orderDetail/operateDetail')

/**
 * 创建 order
 * 1. check order 信息
 * 2. 创建 order 数据
 * 3. 一条条插入 orderdetail 数据
 * 4. 执行创建审批流
 *
 * @return {Promise.<void>}
 */

async function create(args, orderdetails, user, t) {
    let order = await formateOrder(args, user, t)

    await check(order, t)

    orderdetails.forEach(orderdetail => {
        order.amount = NP.plus(order.amount, orderdetail.money)
        formateOrderDetail(orderdetail, order.id)
    })
    let $order = await models.order.create(order, {transaction: t})

    for (let orderdetail of orderdetails) {
        await operateDetail(orderdetail, user, t)
    }

    await machineOperation($order.id, args.isSubmit, user, t)
    return $order
}

module.exports = create


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
 *  - createdUsr
 */

async function formateOrder(args, user, t) {
    let fields = ['description', 'vendorType', 'remark', 'companyId', 'currency']
    let order = {
        id: await generatorId(t),
        orderType: args.currency === currency.CNY ? orderType.Payment : orderType.OverseasPayment,
        applyDate: moment(),
        amount: 0,
        approStatus: orderStatus.toSubmit,
        createdUsr: user.id
    }

    fields.forEach(field => order[field] = args[field])

    return order
}

/**
 * 格式化 orderdetail 数据
 * 1. 添加 orderId
 * 2. 添加 operate = create
 * 3. 格式化 payDate
 * @param orderdetail
 * @param orderId
 */

function formateOrderDetail(orderdetail, orderId) {
    orderdetail.orderId = orderId
    orderdetail.operate = operate.create
    orderdetail.payDate = moment(orderdetail.payDate).format('YYYY-MM')
}

/**
 * 审批流操作
 * 1. 判断 isSubmit
 * 2. true => 执行提交操作
 * 3. 否则，执行创建操作
 */
async function machineOperation(orderId, isSubmit, user, t) {
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

    await machine.create()
    if (isSubmit) await machine.submit()
}


/**
 * 检查 order
 * 1. 检查描述重复性
 */

async function check(order, t) {
    let checkDescription = await models.order.count({
        where: {description: order.description},
        transaction: t
    });
    if (checkDescription !== 0) throw new Error('描述重复！');
}
