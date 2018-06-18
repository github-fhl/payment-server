const config = require('config');
const helper = require(config.helperPath);
const {models, sequelize} = require(config.modelPath);

module.exports = findOne;

async function findOne(id) {
  let obj = await models.receipt.findById(id, {
    include: [
      {
        model: models.subject,
        attributes: ['name']
      },
      {
        model: models.bankStatement,
        attributes: ['voucherId']
      }
    ]
  });

  if (!obj) throw new Error(`${id} 不存在`)
  obj.dataValues.voucherId = obj.bankStatements[0].voucherId;

  return obj
}
