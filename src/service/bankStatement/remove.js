const
  {modelPath} = require('config'),
  {models} = require(modelPath),
  {getMaxIndex, getBankStatement, getBankStatements, smallerIndex} = require('./util');

module.exports = async (args, t) => {
  let maxIndex = await getMaxIndex(args, t);
  let bankStatement = await getBankStatement('getById', args, t);
  if (args.validateVoucher) {
    if (bankStatement.voucherId) {
      throw new Error('该条流水已经做过凭证不能删除');
    }
  }
  await remove(bankStatement, t);
  if (bankStatement.index !== maxIndex) {
    let afterBankStatementArray = await getBankStatements('after', bankStatement, t);
    await smallerIndex(bankStatement, afterBankStatementArray, t);
  }
}

let remove = async (bankStatement, t) => {
  await models.bankStatement.destroy({where: {id: bankStatement.id}, transaction: t});
}