(function() {
  var accesscheck, account, accountrole, applylog, argdetail, argmain, company, init, ldap, order, orderaction, ordersubject, passportroutes, paytype, print, reimuser, reimuserdetail, signature, subject, test, updatePaidDate, updateReceiveOrderStatus, vendor;

  accesscheck = require('../component/accesscheck');

  passportroutes = require("./../component/passport");

  account = require("./account");

  signature = require("./signature");

  accountrole = require("./accountrole");

  order = require("./order");

  orderaction = require("./orderaction");

  //orderdetail = require("./orderdetail")
  paytype = require("./paytype");

  ordersubject = require("./ordersubject");

  subject = require("./subject");

  argmain = require("./argmain");

  argdetail = require("./argdetail");

  company = require("./company");

  vendor = require("./vendor");

  //vendordetail = require("./vendordetail")
  reimuser = require("./reimuser");

  reimuserdetail = require("./reimuserdetail");

  ldap = require("./ldap");

  init = require("./init");

  test = require("./test");

  print = require("./print");

  updateReceiveOrderStatus = require("./updateOrder/updateReceiveOrderStatus");

  updatePaidDate = require("./updateOrder/updatePaidDate");

  applylog = require("./applylog");

  passportroutes = require("./../component/passport");

  module.exports = function(router, rbac, passport) {
    router.route('/test').get(test.test);
    router.route("/initAccount").get(init.initAccount);
    router.route("/initPermission").get(init.initPermission);
    router.route("/initArgs").get(init.initArgs);
    router.route("/initRolePermission").get(init.initRolePermission);
    router.route("/dropAll").get(init.dropAll);
    router.route("/dropOrder").get(init.dropOrder);
    router.route("/dropReimuser").get(init.dropReimuser);
    router.route("/dropAccount").get(init.dropAccount);
    //  router.route("/createOrder")
    //    .get(init.createOrder)
    router.route('/login').put(passport.authenticate('local', {
      failWithError: true,
      failureFlash: true,
      failureHandler: account.loginerror,
      failureRedirect: '/account/loginfailed'
    }), account.login);
    router.route('/logout').put(account.logout); //logout，所有人可以访问
    router.route('/userinfo').get(account.getUserInfo); //获取当前用户信息
    router.route("/accounts").get(accesscheck.can(rbac, 'getlist', 'account'), account.getlist).post(accesscheck.can(rbac, 'new', 'account'), account.new).delete(accesscheck.can(rbac, 'delete', 'account'), account.delete); //获取 //增加 //删除
    router.route("/accounts/:id").get(accesscheck.can(rbac, 'get', 'account'), account.get).put(accesscheck.can(rbac, 'update', 'account'), account.update);
    router.route("/signatures").post(accesscheck.can(rbac, 'new', 'signature'), signature.new); //增加
    router.route("/accountroles").post(accesscheck.can(rbac, 'new', 'accountrole'), accountrole.new).delete(accesscheck.can(rbac, 'delete', 'accountrole'), accountrole.delete); //增加 //删除
    router.route("/cashierUpdateAmount").put(accesscheck.can(rbac, 'update', 'cashierUpdateAmount'), order.cashierUpdateAmount);
    router.route("/currentVendor").get(order.getVendorOnOrder);
    router.route("/orderInvoice").put(accesscheck.can(rbac, 'update', 'orderInvoice'), order.receiveInvoice); //出纳收到 order 的发票
    router.route("/receiveOrderStatus").put(accesscheck.can(rbac, 'update', 'receiveOrderStatus'), updateReceiveOrderStatus.updateReceiveOrderStatus); //出纳修改是否收到打印 order 的状态
    router.route("/paidDate").put(updatePaidDate.updatePaidDate); //出纳修改付款日期
    router.route("/printedOrder").put(accesscheck.can(rbac, 'receive', 'printedOrder'), order.getPrintedOrder); //出纳收到 order 的发票
    router.route("/paidNo").get(accesscheck.can(rbac, 'get', 'paidNo'), order.getPaidNo);
    //  router.route("/submit/orders") #提交审批
    //    .put(accesscheck.can(rbac,'submit','order'), orderaction.action)
    //  router.route("/backout/orders") #撤回申请
    //    .put(accesscheck.can(rbac,'backout','order'), orderaction.action)
    //  router.route("/managerAppro/orders") #主管批准
    //    .put(accesscheck.can(rbac,'managerAppro','order'), orderaction.action)
    //  router.route("/managerRefuse/orders") #主管拒绝
    //    .put(accesscheck.can(rbac,'managerRefuse','order'), orderaction.action)
    //  router.route("/cashierAppro/orders") #出纳批准
    //    .put(accesscheck.can(rbac,'cashierAppro','order'), orderaction.action)
    //  router.route("/cashierRefuse/orders") #出纳拒绝
    //    .put(accesscheck.can(rbac,'cashierRefuse','order'), orderaction.action)
    //  router.route("/financeAppro/orders") #财务批准
    //    .put(accesscheck.can(rbac,'financeAppro','order'), orderaction.action)
    //  router.route("/financeRefuse/orders") #财务拒绝
    //    .put(accesscheck.can(rbac,'financeRefuse','order'), orderaction.action)
    //  router.route("/chiefAppro/orders") #总监批准
    //    .put(accesscheck.can(rbac,'chiefAppro','order'), orderaction.action)
    //  router.route("/chiefRefuse/orders") #总监拒绝
    //    .put(accesscheck.can(rbac,'chiefRefuse','order'), orderaction.action)
    //  router.route("/cashierExport/orders") #出纳导出
    //    .put(accesscheck.can(rbac,'cashierExport','order'), orderaction.action)
    //  router.route("/cashierPayFailed/orders") #出纳付款失败
    //    .put(accesscheck.can(rbac,'cashierPayFailed','order'), orderaction.action)
    //  router.route("/applicantUpdate/orders") #员工修改 order 信息成功
    //    .put(accesscheck.can(rbac,'applicantUpdate','order'), orderaction.action)
    //  router.route("/cashierPaySucceed/orders") #出纳付款成功
    //    .put(accesscheck.can(rbac,'cashierPaySucceed','order'), orderaction.action)
    router.route("/paytypes").get(accesscheck.can(rbac, 'getlist', 'paytype'), paytype.getlist).post(accesscheck.can(rbac, 'new', 'paytype'), paytype.new); //获取 //增加
    router.route("/paytypes/:id").get(accesscheck.can(rbac, 'get', 'paytype'), paytype.get).delete(accesscheck.can(rbac, 'delete', 'paytype'), paytype.delete).put(accesscheck.can(rbac, 'update', 'paytype'), paytype.update); //删除 //更新
    router.route("/ordersubjects").get(accesscheck.can(rbac, 'getlist', 'ordersubject'), ordersubject.getlist).post(accesscheck.can(rbac, 'new', 'ordersubject'), ordersubject.new); //获取 //增加
    router.route("/ordersubjects/:id").get(accesscheck.can(rbac, 'get', 'ordersubject'), ordersubject.get);
    router.route("/subjects").get(accesscheck.can(rbac, 'getlist', 'subject'), subject.getlist).post(accesscheck.can(rbac, 'new', 'subject'), subject.new); //获取 //增加
    router.route("/subjects/:id").get(accesscheck.can(rbac, 'get', 'subject'), subject.get).delete(accesscheck.can(rbac, 'delete', 'subject'), subject.delete).put(accesscheck.can(rbac, 'update', 'subject'), subject.update); //删除 //更新
    router.route("/argmains").get(accesscheck.can(rbac, 'getlist', 'argmain'), argmain.getlist).post(accesscheck.can(rbac, 'new', 'argmain'), argmain.new); //获取 //增加
    router.route("/argmains/:id").get(accesscheck.can(rbac, 'get', 'argmain'), argmain.get).delete(accesscheck.can(rbac, 'delete', 'argmain'), argmain.delete).put(accesscheck.can(rbac, 'update', 'argmain'), argmain.update); //删除 //更新
    router.route("/argdetails").get(accesscheck.can(rbac, 'getlist', 'argdetail'), argdetail.getlist).post(accesscheck.can(rbac, 'new', 'argdetail'), argdetail.new); //获取 //增加
    router.route("/argdetails/:id").get(accesscheck.can(rbac, 'get', 'argdetail'), argdetail.get).delete(accesscheck.can(rbac, 'delete', 'argdetail'), argdetail.delete).put(accesscheck.can(rbac, 'update', 'argdetail'), argdetail.update); //删除 //更新
    router.route("/companys").get(accesscheck.can(rbac, 'getlist', 'company'), company.getlist).post(accesscheck.can(rbac, 'new', 'company'), company.new); //获取 //增加
    router.route("/companys/:id").get(accesscheck.can(rbac, 'get', 'company'), company.get).delete(accesscheck.can(rbac, 'delete', 'company'), company.delete).put(accesscheck.can(rbac, 'update', 'company'), company.update); //删除 //更新
    router.route("/vendors").get(accesscheck.can(rbac, 'getlist', 'vendor'), vendor.getlist).post(accesscheck.can(rbac, 'new', 'vendor'), vendor.new); //获取 //增加
    router.route("/vendorCodes").get(vendor.getAllVendorCode); // 获取所有的 vendorCode
    router.route("/vendors/:id").get(accesscheck.can(rbac, 'get', 'vendor'), vendor.get).delete(accesscheck.can(rbac, 'delete', 'vendor'), vendor.delete).put(accesscheck.can(rbac, 'update', 'vendor'), vendor.update); //删除 //更新
    
    //  router.route("/vendordetails")
    //    .get(accesscheck.can(rbac,'getlist','vendordetail'),vendordetail.getlist)#获取
    //    .post(accesscheck.can(rbac,'new','vendordetail'),vendordetail.new)#增加

    //  router.route("/vendordetails/:id")
    //    .get(accesscheck.can(rbac,'get','vendordetail'),vendordetail.get)
    //    .delete(accesscheck.can(rbac,'delete','vendordetail'),vendordetail.delete)#删除
    //    .put(accesscheck.can(rbac,'update','vendordetail'),vendordetail.update)#更新
    router.route("/reimusers").get(accesscheck.can(rbac, 'getlist', 'reimuser'), reimuser.getlist).post(accesscheck.can(rbac, 'new', 'reimuser'), reimuser.new); //获取 //增加
    router.route("/reimusers/:id").get(reimuser.get).delete(accesscheck.can(rbac, 'delete', 'reimuser'), reimuser.delete).put(accesscheck.can(rbac, 'update', 'reimuser'), reimuser.update); //获取不需要权限 //删除 //更新
    router.route("/reimuserdetails").get(accesscheck.can(rbac, 'getlist', 'reimuserdetail'), reimuserdetail.getlist).post(accesscheck.can(rbac, 'new', 'reimuserdetail'), reimuserdetail.new); //获取 //增加
    router.route("/reimuserdetails/:id").get(accesscheck.can(rbac, 'get', 'reimuserdetail'), reimuserdetail.get).delete(accesscheck.can(rbac, 'delete', 'reimuserdetail'), reimuserdetail.delete); //删除
    router.route("/ldaps").get(accesscheck.can(rbac, 'getlist', 'ldap'), ldap.getlist);
    router.route('/ldaps/departments').get(accesscheck.can(rbac, 'getlist', 'department'), ldap.getDepartments);
    //打印
    router.route('/print/paymentOrder').get(accesscheck.can(rbac, 'print', 'order'), print.paymentOrder);
    router.route('/print/paymentVoucher').get(accesscheck.can(rbac, 'print', 'voucher'), print.paymentVoucher);
    router.route('/checkVendorCode').get(print.checkVendorCode);
    // 下载
    router.route('/download/paymentVoucher').get(print.exportVoucher);
    //    .get(accesscheck.can(rbac,'download','voucher'),print.paymentVoucher)

    //  router.route('/applylogs/:id')
    //    .get(applylog.getlist);
    return router.route('/importVendor').post(vendor.importVendor);
  };

}).call(this);
