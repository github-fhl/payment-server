const
  {modelPath} = require('config'),
  {models} = require(modelPath),
  getInfoSource = require('./getInfoSource');

/**
 * 获取voucher明细
 * 第一步：根据voucherid获取所有的voucher，voucherdetail，
 * 第二步：获取applylog
 * 第三步：获取银行流水
 * 第四步：调用getInfoSource方法获取收付款信息
 * @param args
 * @param t
 * @returns {Promise<{voucherInfo: *, applyLog: *, formatedReceiptInfos: *, aggregatedPaymentInfos: *, colNames: *}>}
 */
module.exports = async (args, t) => {
  let voucherInfo = await getVoucher(args, t);
  let applyLog = await getApplyLog(args, t);
  let bankStatementIds = await getBankStatement(args, t);
  let infoSource = await getInfoSource(bankStatementIds, t);
  return {
    voucherInfo,
    applyLog,
    formatedReceiptInfos: infoSource.formatedReceiptInfos,
    aggregatedPaymentInfos: infoSource.aggregatedPaymentInfos,
    colNames: infoSource.colNames
  };
}

let getVoucher = async (args, t) => {
  return await models.voucher.findOne({where: {id: args.id}, include: [{model: models.voucherdetail}], transaction: t});
}

let getApplyLog = async (args, t) => {
  return await models.applylog.findAll({where: {voucherId: args.id}, order: [['createdAt', 'desc']], transaction: t});
}

let getBankStatement = async (args, t) => {
  let bankStatementArray = [];
  let bankStatements = await models.bankStatement.findAll({where: {voucherId: args.id}, transaction: t});
  for (let item of bankStatements) {
    bankStatementArray.push(item.id);
  }
  return bankStatementArray;
}