const
  remove = require('./remove'),
  create = require('./create'),
  {getBankStatement} = require('./util');

module.exports = async (args, user, t) => {
  let bankStatement = await getBankStatement('getById', args, t);
  if (bankStatement.voucherId) {
    throw new Error('该银行流水已做过凭证，无法编辑');
  }
  await remove(args, t);
  return await create(args, user, t);
}