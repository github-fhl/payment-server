const
  {modelPath, cfg, helperPath} = require('config'),
  {subjectType} = cfg,
  {models, sequelize} = require(modelPath),
  moment = require('moment')

/**
 * 付款完成时
 * 1. 更新 order 的 paidDate/subjectDate
 * 2. 更新 vendorDetail 的最近付款成功日
 */

async function onCashierPay () {
  let orderUpdate = {
    paidDate: this.args.paidDate,
    voucherDate: this.args.paidDate,
    subjectDate: moment(this.args.paidDate).format('YYMM'),
    subjectId: this.args.subjectId
  }
  let $subject = await models.subject.findByPrimary(this.args.subjectId, {transaction: this.t})

  if ($subject.currency !== this.$order.currency) throw new Error(`账号币种错误`)

  await this.$order.update(orderUpdate, {transaction: this.t})

  await updateVendorDate(this.$order.id, this.t)
}
module.exports = onCashierPay

async function updateVendorDate (orderId, t) {
  let $order = await models.order.findByPrimary(orderId, {
    transaction: t,
    include: [{
      model: models.orderdetail,
      where: {status: 1},
      required: false,

      include: [{
        required: true,
        model: models.vendor,

        include: [{
          required: true,
          model: models.vendordetail,
          where: {status: 1, bankNum: {$eq: sequelize.col('orderdetails.bankNum')}}
        }]
      }]
    }]
  })

  for (let detail of $order.orderdetails) {
    if (detail && detail.vendor && detail.vendor.vendordetails[0]){
      detail.vendor.vendordetails[0].payDate = moment();
      await detail.vendor.vendordetails[0].save({transaction: t});
    }
  }
}
