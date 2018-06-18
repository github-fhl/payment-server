const {models} = require('../../../models');
const {cfg} = require('config');
const _ = require('lodash');
const Parameter = require('parameter');

module.exports = async (param) => {
  if (param.type === '公司') {
    return await formatCompanyOrderExcel(param);
  } else if (param.type === '个人') {
    return await formatPersonalOrderExcel(param);
  } else {
    throw new Error('传入的表格类型只能为公司或个人');
  }
}

/**
 * 校验申请单表格参数
 * 第一步：查询订单主体中付款公司是否存在
 * 第二步：查询订单明细中归属公司是否存在
 * 第三步：查询订单明细中成本中心是否存在
 * 第四步：校验订单明细金额之和是否等于订单主体的总金额
 * 第五步：校验参数是否符合条件
 * @param param
 * @returns {Promise<*>}
 */
async function formatCompanyOrderExcel(param) {
  let orderAmount = param.order.amount;
  let detailAmount = 0;
  let companyId;
  let rule;
  let validateResult;
  let parameter = new Parameter();
  let detailObj = {
    vendorName: param.order.vendorName,
    bankNum: param.order.bankNum,
    contacter: param.order.contacter,
    telphone: param.order.telphone,
    bankAddress: param.order.bankAddress,
    bankCodeType: param.order.bankCodeType,
    vendorAddress: param.order.vendorAddress,
    bankCode: param.order.bankCode,
    country: param.order.country,
    bankName: param.order.bankName
  }
  param.order.companyId = await getCompanyIdByCompanyName(param.order.company);
  param.order.vendorType = 'company';
  for (let i = 0; i < param.details.length; i++) {
    detailAmount += param.details[i].money;
    let remusier = await getReimuserIdByReimuserName(param.details[i].costCenter);
    param.details[i].reimuserId = remusier.id
    param.details[i].companyId = await getCompanyIdByCompanyName(remusier.companyId);
    Object.assign(param.details[i], detailObj);
  }
  if (orderAmount !== detailAmount) {
    throw new Error('订单详情总金额之和需等于订单主体总金额');
  }
  rule = getRule(param);
  validateResult = parameter.validate(rule, param);
  if (!_.isEmpty(validateResult)) {
    throw new Error(`${validateResult[0].field} ${validateResult[0].message}`)
  }
  return param;
}

/**
 * 校验申请单表格参数
 * 第一步：查询订单主体中付款公司是否存在
 * 第二步：查询订单明细中归属公司是否存在
 * 第三步：查询订单明细中成本中心是否存在
 * 第四步：校验订单明细金额之和是否等于订单主体的总金额
 * 第五步：校验参数是否符合条件
 * @param param
 * @returns {Promise<*>}
 */
async function formatPersonalOrderExcel(param) {
  let orderAmount = param.order.amount;
  let detailAmount = 0;
  let companyId;
  let rule;
  let validateResult;
  let parameter = new Parameter();
  param.order.companyId = await getCompanyIdByCompanyName(param.order.company);
  param.order.vendorType = 'user';
  for (let i = 0; i < param.details.length; i++) {
    detailAmount += param.details[i].money;
    let remusier = await getReimuserIdByReimuserName(param.details[i].costCenter);
    param.details[i].reimuserId = remusier.id
    param.details[i].companyId = await getCompanyIdByCompanyName(remusier.companyId);
  }
  if (orderAmount !== detailAmount) {
    throw new Error('订单详情总金额之和需等于订单主体总金额');
  }
  rule = getRule(param);
  validateResult = parameter.validate(rule, param);
  if (!_.isEmpty(validateResult)) {
    throw new Error(`${validateResult[0].field} ${validateResult[0].message}`)
  }
  return param;
}

/**
 * 根据公司名称获取公司id
 * @param companyName
 * @returns {Promise<*>}
 */
async function getCompanyIdByCompanyName(companyName) {
  let companyId;
  companyId = await models.company.findOne({
    where: {name: companyName},
    attributes: ['id'],
    raw: true
  })
  if (companyId) {
    return companyId.id;
  }
  return null;
}

/**
 * 根据公司名称获取公司id
 * @param remiuserName
 * @returns {Promise<*>}
 */
async function getReimuserIdByReimuserName(remiuserName) {
  let reimuserId;
  reimuserId = await models.reimuser.findOne({
    where: {name: remiuserName},
    attributes: ['id', 'companyId'],
    raw: true
  })
  if (!reimuserId) {
    throw new Error(`成本中心${remiuserName}不存在`);
  }
  return reimuserId;
}

/**
 * 生成参数校验规则
 * @param param
 * @returns {{order: {type: string, required: boolean}, details: {type: string, required: boolean, itemType: string}}}
 */
function getRule(param) {
  let rule = {
    order: {
      type: 'object',
      required: true,
    },
    details: {
      type: 'array',
      required: true,
      itemType: 'object',
    }
  }

  if (param.order.currency !== cfg.currency.CNY) {
    rule.details.rule = {
      ...rule.details.rule,
      bankAddress: 'string',
      bankCodeType: {type: 'enum', values: Object.values(cfg.bankCodeType), required: true},
      bankCode: 'string',
      country: 'string',
      vendorAddress: {type: 'string', required: true}
    }
  }

  return rule;
}