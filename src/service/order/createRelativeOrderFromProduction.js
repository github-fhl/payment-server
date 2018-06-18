const config = require('config');
const helper = require(config.helperPath);
const {models, sequelize} = require(config.modelPath);

module.exports = async (data, user = 'shscan', t) => {
  helper.common.addUsr(data.order, user);
  helper.common.addUsr(data.orderDetail, user);
  const order = await models.order.create(data.order, {transaction: t});
  const orderDetail = await models.orderdetail.create(data.orderDetail, {transaction: t});

  order.dataValues.orderdetail = orderDetail;
  return order;
}
