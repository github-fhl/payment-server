const
  {getMaxBankStatementByDate} = require('./util'),
  create = require('./create');

/**
 * receipt创建之后创建一条对应的银行流水
 * 第一步：组装参数并根据order类型生成description
 * 第二步：根据付款日期判断银行流水的index
 * 第三步：调用create方法生成一条银行流水
 * @param obj
 * @param user
 * @param t
 * @returns {Promise<void>}
 */
module.exports = async (obj, data, user, t) => {
  let bankStatementInfo = {
    date: obj.collectDate,
    type: 'receipt',
    transactionType: 'Receipt',
    description: obj.description ? obj.payer + obj.description : obj.payer,
    money: obj.amount,
    bankCharge: obj.bankCharge ? obj.bankCharge : 0,
    costType: 'Inhouse',
    commonId: obj.id,
    subjectId: data.subjectId,
    createdUsr: user.id,
    updatedUsr: user.id
  }
  let maxBankStatement = await getMaxBankStatementByDate('Receipt', data, t);
  if (!maxBankStatement) {
    bankStatementInfo.index = 1;
  } else {
    bankStatementInfo.index = maxBankStatement.index + 1;
  }
  await create(bankStatementInfo, user, t);
}