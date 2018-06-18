const
  {modelPath, flowCfg} = require('config'),
  {voucherStatus} = flowCfg,
  {models} = require(modelPath);

/**
 * 更新凭证
 *第一步：更新voucher表中对应的凭证记录
 * 第二步：将原先的voucherdetail删除
 * 第三步：将新的voucherdetail插入表中
 * 第四步：创建一条日志
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
module.exports = async (args, user, t) => {
  await updateVoucher(args, t);
  await removeVoucherDetails(args, t);
  await createVoucherDetails(args, user, t);
  await createApplyLog(args, user, t);
}

let updateVoucher = async (args, t) => {
  await models.voucher.update({
    voucherDate: args.voucherDate,
    remark: args.remark,
    companyId: args.companyId,
    flowStatus: voucherStatus.confirmed
  }, {
    where: {
      id: args.id,
    },
    transaction: t
  });
}

let removeVoucherDetails = async (args, t) => {
  await models.voucherdetail.destroy({where: {voucherId: args.id}, transaction: t});
}

let createVoucherDetails = async (args, user, t) => {
  let voucherDetailArray = [];
  for (let item of args.voucherDetails) {
    item.voucherId = args.id;
    item.createdUsr = user.id;
    item.updateUsr = user.id;
    voucherDetailArray.push(item)
  }
  await models.voucherdetail.bulkCreate(voucherDetailArray, {transaction: t});
}

let createApplyLog = async (args, user, t) => {
  let applyLog = {
    operation: 'update',
    applyStatus: 'handled',
    status: 1,
    voucherId: args.id,
    operator: user.id,
  }
  await models.applylog.create(applyLog, {transaction: t});
}
