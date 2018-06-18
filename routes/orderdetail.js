const
  appcfg = require('./../component/appcfg')
  , models  = require('../models').models
  , fn = require('../component/fn')
  , checkArgType = fn.checkArgType
  , category = appcfg.category
  , payeeType = appcfg.payeeType
  , reimuser = require('./reimuser')
  , {cfg} = require('config')
  ;
/**
 * 只对 orderdetail 的数据进行整理，不创建
 *
 * 规则：
 *    付款对象为 reimuser —— 需要存在vendorName
 *    付款对象为 vendor —— 没有 reimuserId
 *    检查 vendor 是否存在，不存在则创建
 *    检查 vendor 中是否存在对应的 bankNum ，不存在则创建
 *    需要检查是否超出预算
 *
 *    当创建 vendor、vendordetail 后，在 req 中的 refetch 塞入 vendor
 *
 * 操作：
 *    当付款对象为 reimuser 时，需要更新对应的 reimuserdetail 中的 vendordetail
 *
 * @param req
 * @param orderId
 * @param detail
 * @param vendorType
 * @param t
 * @return {Promise.<void>}
 */
exports.handleOrderdetail = async (req, orderId, detail, vendorType, t, orderType) => {
  if (!detail.paytypeId) throw new Error(`6,paytypeId`);
  if (!detail.reimuserId) throw new Error(`6,reimuserId`);

  let tempCategory = (await models.paytype.findOne({where: {id: detail.paytypeId}, attributes:['category'], transaction: t})).dataValues.category;


  //当付款类别为员工相关
  // 成本中心不能为 publicCost
  let c_reimuser = await models.reimuser.findOne({where: {id: detail.reimuserId}, transaction: t});
  if (!c_reimuser) throw new Error(`3,${detail.reimuserId}`);
  if (tempCategory == category.employee) {
    if (c_reimuser.dataValues.name == appcfg.publicCost) throw new Error(`213,类别：${detail.paytypeId} --- 成本中心：${appcfg.publicCost}`);

    detail.payeeType = payeeType.reimuser;
    //判断字段是否存在
    let requiredFileds = ['money', 'bankNum', 'bankName', 'payDate', 'paytypeId', 'vendorName', 'reimuserId'];
    requiredFileds.forEach((field) => {
      if (!detail[field]) throw new Error(`202,${field}`)
    });
    if (!checkArgType(detail.payDate, 'YYYY-MM')) throw new Error(`5,payDate-${detail.payDate}`);
  }
  //当付款类别为运营成本
  // 成本中心只能是 publicCost
  else if (tempCategory == category.operatingCost) {
    // if (c_reimuser.dataValues.name != appcfg.publicCost) throw new Error(`214, 类别：${detail.paytypeId} --- 成本中心：${appcfg.publicCost}`);

    detail.payeeType = payeeType.vendor;
    //判断字段是否存在
    let requiredFileds = ['money', 'bankNum', 'bankName', 'paytypeId', 'paytypedetailId', 'vendorName', 'reimuserId'];
    requiredFileds.forEach((field) => {
      if (!detail[field]) throw new Error(`203,${field}`)
    });
  }

  let newBank = {bankNum: detail.bankNum, bankName: detail.bankName};
  let c_vendor = await models.vendor.findOne({
    where: {name: detail.vendorName},
    transaction: t,
    include: [{
      required: false,
      model: models.vendordetail,
      where: newBank
    }]
  });

  let vendordetailId;  // 当前使用的vendordetailId

  //当 vendor 不存在时，创建对应的 vendor 和 detail，将 vendorId 写入 detail 中
  // 当需要创建 vendordetail 时，检查是否存在这个账号，因为所有的账号都是不可重复的
  let checkBankNumDuplicate = async (bankNum) => {
    console.log('bankNum: ', bankNum);
    let countNum = await models.vendordetail.count({where: {bankNum: bankNum, status: 1}, transaction: t});
    console.log('countNum: ', countNum);
    if (countNum != 0) throw new Error(`215,${bankNum}`);
  };
  
  if (!c_vendor){
    let newVendor = {name: detail.vendorName, contacter: detail.contacter, telphone: detail.telphone, vendorType: vendorType};
    let vendorId = (await models.vendor.create(newVendor, {transaction: t})).dataValues.id;
    newBank.vendorId = vendorId;
    detail.vendorId = vendorId;
    await checkBankNumDuplicate(newBank.bankNum);
    vendordetailId = (await models.vendordetail.create(newBank, {transaction: t})).dataValues.id;
    req.refetch.push('vendor');
  }else{
    detail.vendorId = c_vendor.dataValues.id;

    //vendor 的 bankNum 不存在时，给对应的 vendor 添加 bankNum
    let checkNum = c_vendor.vendordetails.filter((item) => {
      return item.dataValues.bankNum == newBank.bankNum && item.dataValues.bankName == newBank.bankName
    });
    if (checkNum.length == 0){
      newBank.vendorId = detail.vendorId;
      await checkBankNumDuplicate(newBank.bankNum);
      vendordetailId = (await models.vendordetail.create(newBank, {transaction: t})).dataValues.id;
      req.refetch.push('vendor');
    }else {
      vendordetailId = checkNum[0].dataValues.id;
    }

    //如果 contracter、telphone 不同则更新
    if (c_vendor.dataValues.contacter != detail.contacter || c_vendor.dataValues.telphone != detail.telphone){
      c_vendor.contacter = detail.contacter;
      c_vendor.telphone = detail.telphone;
      await c_vendor.save({transaction: t});
    }
  }

  /*** 当付款类别为员工相关时，需要更新对应的 reimuserdetail 中的 vendordetail
   *   如果成本中心名为 others 时，则不检查
   *   需要检查是否超出预算，如果 orderType 为 Expense，则不检查
   * */
  if (tempCategory == category.employee && c_reimuser.name !== appcfg.others){

    let c_currentReimuser = await reimuser.getCurrentReimuserDetail(detail.reimuserId, detail.paytypeId, null, t);
    if (c_currentReimuser.reimuserdetails.length != 0) {
      let currentDetail = c_currentReimuser.reimuserdetails[0];
      currentDetail.vendordetailId = vendordetailId;
      await currentDetail.save({transaction: t});
    }

    let c_targetReimuser = await reimuser.getCurrentReimuserDetail(detail.reimuserId, detail.paytypeId, detail.payDate, t, orderId);
    if (c_targetReimuser.reimuserdetails.length == 0) throw new Error(`204,${c_targetReimuser.dataValues.name}---${detail.payDate}`);
    let targetDetail = c_targetReimuser.reimuserdetails[0];
    console.log('rest: ', c_targetReimuser.dataValues.rest);
    if (parseFloat(detail.money) > parseFloat(c_targetReimuser.dataValues.rest)) {

      if (orderType !== cfg.orderType.Expense) {
        throw new Error(`208,${c_targetReimuser.dataValues.name} --- ${detail.paytypeId}`);
      }
    }
    targetDetail.vendordetailId = vendordetailId;
    await targetDetail.save({transaction: t});
  }

  detail.orderId = orderId;
};
