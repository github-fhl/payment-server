const axios = require('axios');
const config = require('config');
const helper = require(config.helperPath);
const {models, sequelize} = require(config.modelPath);
const appcfg = require(`${config.componentPath}/appcfg`);
const moment = require('moment');
const createBankStatementAfterCreateReceipt = require('../bankStatement/createBankStatementAfterCreateReceipt');

module.exports = create;

async function create(data, user, t) {
  helper.common.addUsr(data, user);

  // data.collectBalanceId = await createReceiptBalance(data, user, t);

  data.id = await generatorId(data, t)

  const obj = await models.receipt.create(data, {transaction: t});
  await createBankStatementAfterCreateReceipt(obj, data, user, t);
  return obj;
}

/**
 * 获取 receipt 的 id
 * 1.
 */
async function generatorId (data, t) {

  let date = moment(data.collectDate).format('YYYYMM')
  let max = await models.receipt.max('id', {
    where: {id: {$like: `RE${date}%`}},
    transaction: t
  })
  if (!max) return `RE${date}001`
  return `RE${(parseInt(max.slice(2)) + 1)}`
}

// 同步在production系统中创建一条回款配平
async function createReceiptBalance(receipt, user, t) {
  const url = `http://localhost:${config.productionPort}/receipts/collectBalance`;
  const {data} = await axios.post(url, {
    description: receipt.description,
    amount: receipt.amount,
    paidNo: receipt.paidNo,
    user: user.id
  });

  return data.obj.id;
}
