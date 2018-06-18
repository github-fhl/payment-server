/* eslint-disable */

module.exports = (models) => {

  models.account.belongsTo(models.account, {foreignKey: {name: 'managerUsr'}});
  models.account.hasMany(models.account, {foreignKey: {name: 'managerUsr'}});
  
  models.account.belongsTo(models.account, {foreignKey: {name: 'directorUsr'}});
  models.account.hasMany(models.account, {foreignKey: {name: 'directorUsr'}});
  
  models.account.belongsTo(models.account, {foreignKey: {name: 'createdUsr', readOnly : true}});
  models.account.hasMany(models.account, {foreignKey: {name: 'createdUsr', readOnly : true}});
  
  models.account.belongsTo(models.account, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  models.account.hasMany(models.account, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  
  models.signature.belongsTo(models.account, {foreignKey: {name: 'accountId', allowNull: false}});
  models.account.hasMany(models.signature, {foreignKey: {name: 'accountId', allowNull: false}});
  
  models.account.belongsToMany(models.role, {through: {model: models.accountrole, unique: false}});
  models.role.belongsToMany(models.account, {through: {model: models.accountrole, unique: false}});
  
  models.accountrole.belongsTo(models.role, {foreignKey: {name: 'roleId', allowNull: false}});
  models.role.hasMany(models.accountrole, {foreignKey: {name: 'roleId', allowNull: false}});
  
  models.accountrole.belongsTo(models.account, {foreignKey: {name: 'accountId', allowNull: false}});
  models.account.hasMany(models.accountrole, {foreignKey: {name: 'accountId', allowNull: false}});
  
  models.grant.belongsTo(models.role, {foreignKey: {name: 'roleId', allowNull: false}});
  models.role.hasMany(models.grant, {foreignKey: {name: 'roleId', allowNull: false}});
  
  models.grant.belongsTo(models.role, {foreignKey: {name: 'targetroleId'}});
  models.role.hasMany(models.grant, {foreignKey: {name: 'targetroleId'}});
  
  models.grant.belongsTo(models.permission, {foreignKey: {name: 'targetpermissionId'}});
  models.permission.hasMany(models.grant, {foreignKey: {name: 'targetpermissionId'}});
  
  models.applylog.belongsTo(models.order, {foreignKey: {name: 'orderId'}});
  models.order.hasMany(models.applylog, {foreignKey: {name: 'orderId'}});
  
  models.applylog.belongsTo(models.account, {foreignKey: {name: 'operator'}, as: 'Operator'});
  models.account.hasMany(models.applylog, {foreignKey: {name: 'operator'}, as: 'Operators'});
  
  models.applylog.belongsTo(models.account, {foreignKey: {name: 'toHandleUsr'}});
  models.account.hasMany(models.applylog, {foreignKey: {name: 'toHandleUsr'}});
  
  models.applylog.belongsTo(models.role, {foreignKey: {name: 'toHandleRole'}});
  models.role.hasMany(models.applylog, {foreignKey: {name: 'toHandleRole'}});
  
  models.applylog.belongsTo(models.voucher, {foreignKey: {name: 'voucherId'}});
  models.voucher.hasMany(models.applylog, {foreignKey: {name: 'voucherId'}});
  
  models.order.belongsTo(models.company, {foreignKey: {name: 'companyId'}});
  models.company.hasMany(models.order, {foreignKey: {name: 'companyId'}});
  
  models.order.belongsTo(models.subject, {foreignKey: {name: 'subjectId'}});
  models.subject.hasMany(models.order, {foreignKey: {name: 'subjectId'}});
  
  models.order.belongsTo(models.account, {foreignKey: {name: 'createdUsr', readOnly : true}});
  models.account.hasMany(models.order, {foreignKey: {name: 'createdUsr', readOnly : true}});
  
  models.order.belongsTo(models.account, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  models.account.hasMany(models.order, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  
  models.orderdetail.belongsTo(models.paytype, {foreignKey: {name: 'paytypeId'}});
  models.paytype.hasMany(models.orderdetail, {foreignKey: {name: 'paytypeId'}});
  
  models.orderdetail.belongsTo(models.paytypedetail, {foreignKey: {name: 'paytypedetailId'}});
  models.paytypedetail.hasMany(models.orderdetail, {foreignKey: {name: 'paytypedetailId'}});
  
  models.orderdetail.belongsTo(models.company, {foreignKey: {name: 'companyId'}});
  models.company.hasMany(models.orderdetail, {foreignKey: {name: 'companyId'}});
  
  models.orderdetail.belongsTo(models.order, {foreignKey: {name: 'orderId', allowNull: false}});
  models.order.hasMany(models.orderdetail, {foreignKey: {name: 'orderId', allowNull: false}});
  
  models.orderdetail.belongsTo(models.reimuser, {foreignKey: {name: 'spendUsr'}});
  models.reimuser.hasMany(models.orderdetail, {foreignKey: {name: 'spendUsr'}});
  
  models.orderdetail.belongsTo(models.reimuser, {foreignKey: {name: 'reimuserId'}});
  models.reimuser.hasMany(models.orderdetail, {foreignKey: {name: 'reimuserId'}});
  
  models.orderdetail.belongsTo(models.vendor, {foreignKey: {name: 'vendorId'}});
  models.vendor.hasMany(models.orderdetail, {foreignKey: {name: 'vendorId'}});
  
  models.orderdetail.belongsTo(models.account, {foreignKey: {name: 'createdUsr', readOnly : true}});
  models.account.hasMany(models.orderdetail, {foreignKey: {name: 'createdUsr', readOnly : true}});
  
  models.orderdetail.belongsTo(models.account, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  models.account.hasMany(models.orderdetail, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  
  models.paytype.belongsTo(models.subject, {foreignKey: {name: 'subjectId'}});
  models.subject.hasMany(models.paytype, {foreignKey: {name: 'subjectId'}});
  
  models.paytypedetail.belongsTo(models.paytype, {foreignKey: {name: 'paytypeId', readOnly : true}});
  models.paytype.hasMany(models.paytypedetail, {foreignKey: {name: 'paytypeId', readOnly : true}});
  
  models.paytypedetail.belongsTo(models.subject, {foreignKey: {name: 'subjectId'}});
  models.subject.hasMany(models.paytypedetail, {foreignKey: {name: 'subjectId'}});
  
  models.subject.belongsTo(models.account, {foreignKey: {name: 'createdUsr', readOnly : true}});
  models.account.hasMany(models.subject, {foreignKey: {name: 'createdUsr', readOnly : true}});
  
  models.subject.belongsTo(models.account, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  models.account.hasMany(models.subject, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  
  models.argmain.belongsTo(models.account, {foreignKey: {name: 'createdUsr', readOnly : true}});
  models.account.hasMany(models.argmain, {foreignKey: {name: 'createdUsr', readOnly : true}});
  
  models.argmain.belongsTo(models.account, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  models.account.hasMany(models.argmain, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  
  models.argdetail.belongsTo(models.argmain, {foreignKey: {name: 'argmainId', allowNull: false}});
  models.argmain.hasMany(models.argdetail, {foreignKey: {name: 'argmainId', allowNull: false}});
  
  models.argdetail.belongsTo(models.account, {foreignKey: {name: 'createdUsr', readOnly : true}});
  models.account.hasMany(models.argdetail, {foreignKey: {name: 'createdUsr', readOnly : true}});
  
  models.argdetail.belongsTo(models.account, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  models.account.hasMany(models.argdetail, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  
  models.company.belongsTo(models.account, {foreignKey: {name: 'createdUsr', readOnly : true}});
  models.account.hasMany(models.company, {foreignKey: {name: 'createdUsr', readOnly : true}});
  
  models.company.belongsTo(models.account, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  models.account.hasMany(models.company, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  
  models.vendor.belongsTo(models.account, {foreignKey: {name: 'createdUsr', readOnly : true}});
  models.account.hasMany(models.vendor, {foreignKey: {name: 'createdUsr', readOnly : true}});
  
  models.vendor.belongsTo(models.account, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  models.account.hasMany(models.vendor, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  
  models.vendordetail.belongsTo(models.vendor, {foreignKey: {name: 'vendorId', allowNull: false}});
  models.vendor.hasMany(models.vendordetail, {foreignKey: {name: 'vendorId', allowNull: false}});
  
  models.vendordetail.belongsTo(models.account, {foreignKey: {name: 'createdUsr', readOnly : true}});
  models.account.hasMany(models.vendordetail, {foreignKey: {name: 'createdUsr', readOnly : true}});
  
  models.vendordetail.belongsTo(models.account, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  models.account.hasMany(models.vendordetail, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  
  models.reimuser.belongsTo(models.company, {foreignKey: {name: 'companyId'}});
  models.company.hasMany(models.reimuser, {foreignKey: {name: 'companyId'}});
  
  models.reimuser.belongsTo(models.account, {foreignKey: {name: 'createdUsr', readOnly : true}});
  models.account.hasMany(models.reimuser, {foreignKey: {name: 'createdUsr', readOnly : true}});
  
  models.reimuser.belongsTo(models.account, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  models.account.hasMany(models.reimuser, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  
  models.reimuserdetail.belongsTo(models.reimuser, {foreignKey: {name: 'reimuserId', allowNull: false}});
  models.reimuser.hasMany(models.reimuserdetail, {foreignKey: {name: 'reimuserId', allowNull: false}});
  
  models.reimuserdetail.belongsTo(models.paytype, {foreignKey: {name: 'paytypeId'}});
  models.paytype.hasMany(models.reimuserdetail, {foreignKey: {name: 'paytypeId'}});
  
  models.reimuserdetail.belongsTo(models.paytypedetail, {foreignKey: {name: 'paytypedetailId'}});
  models.paytypedetail.hasMany(models.reimuserdetail, {foreignKey: {name: 'paytypedetailId'}});
  
  models.reimuserdetail.belongsTo(models.vendordetail, {foreignKey: {name: 'vendordetailId'}});
  models.vendordetail.hasMany(models.reimuserdetail, {foreignKey: {name: 'vendordetailId'}});
  
  models.reimuserdetail.belongsTo(models.account, {foreignKey: {name: 'createdUsr', readOnly : true}});
  models.account.hasMany(models.reimuserdetail, {foreignKey: {name: 'createdUsr', readOnly : true}});
  
  models.reimuserdetail.belongsTo(models.account, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  models.account.hasMany(models.reimuserdetail, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  
  models.receipt.belongsTo(models.company, {foreignKey: {name: 'companyId'}});
  models.company.hasMany(models.receipt, {foreignKey: {name: 'companyId'}});
  
  models.receipt.belongsTo(models.subject, {foreignKey: {name: 'subjectId'}});
  models.subject.hasMany(models.receipt, {foreignKey: {name: 'subjectId'}});
  
  models.receipt.belongsTo(models.account, {foreignKey: {name: 'createdUsr', readOnly : true}});
  models.account.hasMany(models.receipt, {foreignKey: {name: 'createdUsr', readOnly : true}});
  
  models.receipt.belongsTo(models.account, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  models.account.hasMany(models.receipt, {foreignKey: {name: 'updatedUsr', readOnly : true}});
  
  models.bankStatement.belongsTo(models.order, {foreignKey: {name: 'commonId'}, constraints: false, as: 'order'});
  models.order.hasMany(models.bankStatement, {foreignKey: {name: 'commonId'}, constraints: false, scope: { type: 'order'}});
  
  models.bankStatement.belongsTo(models.receipt, {foreignKey: {name: 'commonId'}, constraints: false, as: 'receipt'});
  models.receipt.hasMany(models.bankStatement, {foreignKey: {name: 'commonId'}, constraints: false, scope: { type: 'receipt'}});
  
  models.bankStatement.belongsTo(models.subject, {foreignKey: {name: 'subjectId'}});
  models.subject.hasMany(models.bankStatement, {foreignKey: {name: 'subjectId'}});
  
  models.bankStatement.belongsTo(models.voucher, {foreignKey: {name: 'voucherId'}});
  models.voucher.hasMany(models.bankStatement, {foreignKey: {name: 'voucherId'}});
  
  models.bankStatement.belongsTo(models.account, {foreignKey: {name: 'createdUsr'}});
  models.account.hasMany(models.bankStatement, {foreignKey: {name: 'createdUsr'}});
  
  models.bankStatement.belongsTo(models.account, {foreignKey: {name: 'updatedUsr'}});
  models.account.hasMany(models.bankStatement, {foreignKey: {name: 'updatedUsr'}});
  
  models.voucher.belongsTo(models.company, {foreignKey: {name: 'companyId'}});
  models.company.hasMany(models.voucher, {foreignKey: {name: 'companyId'}});
  
  models.voucher.belongsTo(models.vendor, {foreignKey: {name: 'vendorId'}});
  models.vendor.hasMany(models.voucher, {foreignKey: {name: 'vendorId'}});
  
  models.voucher.belongsTo(models.account, {foreignKey: {name: 'createdUsr'}});
  models.account.hasMany(models.voucher, {foreignKey: {name: 'createdUsr'}});
  
  models.voucher.belongsTo(models.account, {foreignKey: {name: 'updatedUsr'}});
  models.account.hasMany(models.voucher, {foreignKey: {name: 'updatedUsr'}});
  
  models.voucherdetail.belongsTo(models.voucher, {foreignKey: {name: 'voucherId', allowNull: false}});
  models.voucher.hasMany(models.voucherdetail, {foreignKey: {name: 'voucherId', allowNull: false}});
  
  models.voucherdetail.belongsTo(models.subject, {foreignKey: {name: 'subjectId', allowNull: false}});
  models.subject.hasMany(models.voucherdetail, {foreignKey: {name: 'subjectId', allowNull: false}});
  
  models.voucherdetail.belongsTo(models.account, {foreignKey: {name: 'createdUsr'}});
  models.account.hasMany(models.voucherdetail, {foreignKey: {name: 'createdUsr'}});
  
  models.voucherdetail.belongsTo(models.account, {foreignKey: {name: 'updatedUsr'}});
  models.account.hasMany(models.voucherdetail, {foreignKey: {name: 'updatedUsr'}});
  
  models.excRate.belongsTo(models.account, {foreignKey: {name: 'createdUsr'}});
  models.account.hasMany(models.excRate, {foreignKey: {name: 'createdUsr'}});
  
  models.excRate.belongsTo(models.account, {foreignKey: {name: 'updatedUsr'}});
  models.account.hasMany(models.excRate, {foreignKey: {name: 'updatedUsr'}});
  
};
