const
  {modelPath} = require('config'),
  {models} = require(modelPath),
  moment = require('moment'),
  {getMaxBankStatementByDate} = require('./util'),
  create = require('./create');

/**
 * payment创建之后创建一条对应的银行流水
 * 第一步：获取order对应的所有orderdetail
 * 第二步：组装参数并根据order类型生成description
 * 第三步：根据付款日期判断银行流水的index
 * 第四步：调用create方法生成一条银行流水
 * @param obj
 * @param user
 * @param t
 * @returns {Promise<void>}
 */
module.exports = async (obj, user, t) => {
  let order = await models.order.findOne({
    where: {id: obj.id},
    include: [{
      model: models.orderdetail
    }, {
      model: models.company,
      attributes: ['name']
    }],
    transaction: t
  });
  let bankStatementInfo = {
    date: moment(order.paidDate).format('YYYY-MM-DD'),
    type: 'order',
    transactionType: 'Payment',
    money: order.amount,
    bankCharge: order.bankCharge,
    costType: 'Inhouse',
    commonId: order.id,
    description: order.company.name,
    subjectId: order.subjectId,
    createdUsr: user.id,
    updatedUsr: user.id
  }
  let maxBankStatement = await getMaxBankStatementByDate('Payment', order, t);
  if (!maxBankStatement) {
    bankStatementInfo.index = 1;
  } else {
    bankStatementInfo.index = maxBankStatement.index + 1;
  }
  await create(bankStatementInfo, user, t)
}