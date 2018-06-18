const
  {modelPath} = require('config'),
  {models} = require(modelPath),
  NP = require('number-precision'),
  {getMaxIndex, validateMaxBeforeDate, validateThisDate, getInitBalance, getBankStatements, largerIndex} = require('./util');

/**
 * 创建流水步骤：
 * 第一步：检查加上本条记录后银行流水总金额是否超过order或receipt金额
 * 第二步：获取最大的index，如果传入的index大于最大的index+1说明跳号
 * 如果传入的index等于最大的index+1说明创建一条流水记录
 * 如果传入的index小于最大的index+1说明插入一条流水记录
 *根据不同的情况调取不同的方法
 * @param args
 * @param user
 * @param t
 * @returns {Promise<void>}
 */
module.exports = async (args, user, t) => {
  if (args.checkAmountAndBankcharge) {
    if (args.money === 0 && args.bankCharge === 0) {
      throw new Error('交易金额和银行手续费都为0时该条记录无意义不允许创建');
    }
  }
  if (args.commonId) {
    await checkAmount(args, t);
  }
  let maxIndex = await getMaxIndex(args, t);
  if (args.index > maxIndex + 1) {
    args.index = maxIndex + 1;
    return await createBankStatement(args, user, t);
  } else if (args.index === maxIndex + 1) {
    return await createBankStatement(args, user, t);
  } else {
    return await insertBankStatement(args, user, t);
  }
}

/**
 * 创建银行流水
 * 第一步：如果index大于1校验前一条记录的日期是否大于本条记录，如果是则报错
 * 第二步：获取初始金额
 * 第三步：调用create方法创建银行流水
 * @param args
 * @param user
 * @param t
 * @returns {Promise<*>}
 */
async function createBankStatement(args, user, t) {
  if (args.index > 1) {
    await validateMaxBeforeDate(args, t);
  }
  let initBalance = await getInitBalance('previous', args, t);
  return await create(initBalance, args, user, t);
}

/**
 * 插入银行流水
 * 第一步：校验前一天于后一天的日期
 * 第二步：获取前一天的金额并根据本条记录交易类型在前一条记录的基础上构建本条记录的金额
 * 第三步：获取并更新本条记录之后所有的记录（更新index和balance）
 * 第四步：插入本条记录
 * @param args
 * @param user
 * @param t
 * @returns {Promise<void>}
 */
async function insertBankStatement(args, user, t) {
  await validateThisDate(args, t);
  if (args.index !== 1) {
    await validateMaxBeforeDate(args, t);
  }
  let initBalance = await getInitBalance('previous', args, t);
  let bankStatementArray = await getBankStatements('afterIncludeThis', args, t);
  await largerIndex(args, bankStatementArray, t);
  return await create(initBalance, args, user, t);
}

/**
 * 创建银行流水
 * 第一步：构造参数
 * 第二步：根据交易类型计算本条记录的银行流水
 * 第三步：往数据库中插入一条新的银行流水记录
 * @param initBalance
 * @param args
 * @param user
 * @param t
 * @returns {Promise<void>}
 */
let create = async (initBalance, args, user, t) => {
  let bankStatementInfo = {
    costType: args.costType,
    subjectId: args.subjectId,
    index: args.index,
    date: args.date,
    transactionType: args.transactionType,
    commonId: args.commonId,
    description: args.description,
    money: args.money,
    bankCharge: args.bankCharge,
    createdUsr: user.id,
    updatedUsr: user.id
  }
  if (args.voucherId) {
    bankStatementInfo.voucherId = args.voucherId;
  }
  if (args.transactionType === 'Payment' && args.commonId) {
    bankStatementInfo.type = 'order';
  } else if (args.transactionType === 'Receipt' && args.commonId) {
    bankStatementInfo.type = 'receipt';
  } else if (args.transactionType && !args.commonId) {
    bankStatementInfo.type = null;
  }
  switch (args.transactionType) {
    case 'Payment':
      bankStatementInfo.balance = NP.minus(initBalance, NP.plus(args.money, args.bankCharge));
      break;
    case 'Receipt':
      bankStatementInfo.balance = NP.plus(initBalance, NP.minus(args.money, args.bankCharge));
      break;
  }
  return await models.bankStatement.create(bankStatementInfo, {transaction: t});
}

let checkAmount = async (args, t) => {
  let amount = args.money;
  let bankCharge = args.bankCharge;
  let AmountAndBankCharge = await getAmountAndBankCharge(args, t);
  let bankStatements = await models.bankStatement.findAll({
    where: {subjectId: args.subjectId, commonId: args.commonId},
    transaction: t
  });
  if (bankStatements.length > 0) {
    bankStatements.forEach(item => {
      amount = amount + item.money;
      bankCharge = bankCharge + args.bankCharge;
    })
  }
  if (amount > AmountAndBankCharge.amount) {
    throw new Error('加上本条银行流水后，银行流水总金额大于录入时总金额');
  }
  if (bankCharge > AmountAndBankCharge.bankCharge) {
    throw new Error('加上本条银行流水后，银行流水总手续费大于录入时总手续费');
  }
}

let getAmountAndBankCharge = async (args, t) => {
  let obj;
  if (args.transactionType === 'Payment' && args.commonId) {
    obj = await models.order.findOne({where: {id: args.commonId}, transaction: t});
  } else if (args.transactionType === 'Receipt' && args.commonId) {
    obj = await models.receipt.findOne({where: {id: args.commonId}, transaction: t});
  }
  if (!obj) {
    throw new Error('单号不存在');
  }
  return {
    amount: obj.amount,
    bankCharge: obj.bankCharge
  }
}
