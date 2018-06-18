const
  appcfg = require('./appcfg')
  , idType = appcfg.idType
  , modelArr = appcfg.decorateModels.modelArr
  , fieldArr = appcfg.decorateModels.fieldArr
  , moment = require('moment')
  , models  = require('../models').models
  , common = require('./common')
  , rbac = require('../component/accesscheck').rbac
  , rbacGrant = require('../component/accesscheck').rbacGrant
  , getreqparameter = require('./common').getreqparameter
  , util = require('./util')
  , clone = require('clone')
  , removeAttrs = appcfg.removeAttrs
  , hasRole=require('../component/accesscheck').hasRole
;

/**
 * 根据不同情况生成不同的id号
 * @param model
 * @param type
 * @return {Promise.<string>}
 */
exports.generatorId = async (model, type) => {

  if (!model || !idType[type]) throw new Error('please check value of model || type !');
  if (type == idType.order){
    let data = moment().format('YYYYMM');
    let max = await model.max('id', {where: {id: {$like: appcfg.orderPrix + data+'%'}}});
    if (!max){
      return appcfg.orderPrix + data+'001';
    }
    return (appcfg.orderPrix  + (parseInt(max.slice(2)) + 1)).toString();
  }
};


/**
 * 根据给定的数据表名，对查询结果进行装饰
 * 将 "company" : { "name" : "中华餐饮" } 转化为 "companyName" : "中华餐饮"
 *
 * @param target
 * @return {[*,*]}
 */
exports.decorateResults = (target) =>{
  for (let key in target){
    let v = target[key];
    if (Object.getType(v) == 'object'){
      let j = modelArr.indexOf(key);
      if (j != -1){
        let postfix = fieldArr[j];
        let a = postfix[0].toUpperCase();
        postfix = a + postfix.substring(1);
        target[modelArr[j] + postfix] = v[fieldArr[j]];
        delete target[key]
      }else exports.decorateResults(target[key])
    }else if(Object.getType(v) == 'array'){
      v.forEach((item)=>{
        exports.decorateResults(item)
      })
    }
  }
};

/**
 * 对查询的条件进行装饰，添加对应的关联表
 * 如果字段包含vendorId、companyId、reimuser、paytype，那么对应的添加include
 *
 * @param model
 * @param condition
 */

exports.decorateCondition = (model, condition) => {
  if (condition.include){
    condition.include.forEach((item)=>{
      exports.decorateCondition(item.model, item)
    })
  }

  let atts = Object.keys(model.attributes);
  for (let i = 0, len = modelArr.length; i < len; i++){
    let m = modelArr[i];
    let mIndex = atts.indexOf(m+'Id');
    if (mIndex != -1){
      let value = {model: models[m], required: false, attributes: fieldArr[i]};
      exports.createObjOrAddAttribute(condition, 'include', value, 'array');
    }
  }
};


/**
 * 根据表与关联表，获取指定id的order的数据
 *
 * @param model
 * @param whereCondition
 * @param t
 * @param assModel
 * @return {Promise.<*>}
 */
async function getData(model, whereCondition, t, assModel) {
  let condition = {
    where: whereCondition,
    attributes: {exclude: removeAttrs.concat(['status'])},
    transaction: t
  };
  if (arguments.length > 3){
    condition.include = [];
    for (let i = 3, len = arguments.length; i < len; i++){
      let includeData = {
        model: arguments[i],
        required: false,
        separate: true,
        where: {status: 1},
        attributes: {exclude: removeAttrs}
      };

      /********************* 当 model 为applylog时，进行排序 *******************/
      if (arguments[i] == models.applylog) {
        includeData.order = [['createdAt', 'DESC']];
      }
      condition.include.push(includeData)
    }
  }

  exports.decorateCondition(model, condition);
  return await model.findOne(condition);

}
exports.getData = getData;


/**
 * 功能：给source的一级属性添加一个二级属性，该一级属性可能存在也可能不存在
 * 当不存在时，创建一级属性
 * 存在时，为一级属性添加一个二级属性
 *
 * 如果target为Object，则一级属性的组成是 source[target] = { key : value }
 * 如果target为Array，则一级属性的组成是 source[target] = [value]
 *
 * @param source
 * @param target
 * @param key
 * @param value
 * @param type
 */
exports.createObjOrAddAttribute = (source, target, key, value, type = 'object') =>{

  if (Object.getType(key) !== 'string'){
    type = value;
    value = key;
  }

  if (common.isExist(source[target])){

    switch (type){
      case 'object':
        source[target][key] = value;
        break;
      case 'array':
        source[target].push(value)
    }
  }
  else{
    switch (type){
      case 'object':
        source[target]= { [`${key}`]: value};
        break;
      case 'array':
        source[target]= [value];
    }
  }
};


/**
 * 需废弃，不安全
 * 更新details
 * 前端规则：
 *    如果是编辑，则发送原先的detail的id
 *    如果是新建，则detail中没有id
 *    如果是删除，则details中没有这条detail
 *
 * 后端规则：
 *    编辑：更新对应id的detail
 *    新建：新建对应的detail
 *    删除：删除对应的detail
 *
 * @param req
 * @param oldDetials
 * @param newDetails
 * @param modeldetail
 * @param t
 * @param handle   对 detail 数据进行处理
 * @param targetId  detail 对应的主表 ID
 * @param vendorType  order 的 vendorType
 * @return {Promise.<void>}
 */
exports.updateDetailInfo = async(req, oldDetials, newDetails, modeldetail, t, handle, targetId, vendorType)=>{
  let existArr = oldDetials.map((item)=>{
    return item.dataValues.id;
  });
  console.log('existArr:',　existArr);
  let updateArr = newDetails.map((item)=>{
    if (item.id){
      return item.id
    }
  });
  console.log('updateArr:',　updateArr);
  //当旧的detail的id，不存在于新的detail中时，代表需要删除这条detail
  for (let i = 0, len = existArr.length; i < len; i++){
    let item = existArr[i];
    if (updateArr.indexOf(item) === -1){
      await modeldetail.update({status: 0, updatedUsr: req.user.id}, {where: {id: item}, transaction: t})
    }
  }

  for (let i = 0, len = newDetails.length; i < len; i++){
    let item = newDetails[i];
    if (handle) await handle(req, targetId, item, vendorType, t);
    //存在id就进行更新
    if (common.isExist(item.id)){
      item.updatedUsr = req.user.id;
      await modeldetail.update(item, {where: {id: item.id}, transaction: t})
    }
    //不存在就新增
    else{
      item.createdUsr = req.user.id;
      await modeldetail.create(item, {transaction: t})
    }
  }
};

/**
 * 安全的更新details
 * 前端规则：
 *    每一条 detail 都给传递一个 operate 的字段，new / update / delete / noChange
 *
 * 后端规则：
 *    编辑：更新对应id的detail
 *    新建：检查 id 是否重复，新建对应的detail
 *    删除：删除对应的detail
 *
 * @param req
 * @param key  主键名
 * @param keyArr
 * @param newDetails
 * @param modeldetail
 * @param t
 * @return {Promise.<void>}
 */
exports.updateDetailInfoSafety = async(req, key, keyArr, newDetails, modeldetail, t) => {

  for (let i = 0, len = newDetails.length; i < len; i++){
    let item = newDetails[i];
    switch (item.operate){
      case appcfg.operate.new:
        await modeldetail.create(item, {transaction: t});
        break;
      case appcfg.operate.update:
        if (!item[key]) throw new Error(`8,第--${i}--条`);
        if (keyArr.indexOf(item[key]) == -1) throw new Error(`9, detail => ${item[key]}`);
        await modeldetail.update(item, {where: {[key]: item[key]}, transaction: t});
        break;
      case appcfg.operate.delete:
        if (!item[key]) throw new Error(`8,第--${i}--条`);
        if (keyArr.indexOf(item[key]) == -1) throw new Error(`9,detail => ${item[key]}`);
        await modeldetail.update({status: 0, updatedUsr: req.user.id}, {where: {[key]: item[key]}, transaction: t});
        break;
    }
  }
};

/**
 * 根据账户id，判断该用户是否含有给定的角色
 * 如果是 GL 和 InterCompany，则允许他们查看 finance 的order
 *
 * @param accountId
 * @param roleId
 * @param t
 * @return {Promise.<boolean>}
 */

exports.checkRole = async (accountId, roleId, t) =>{
  let roles = await exports.getRoles(accountId, t);
  let flag = false;
  if (roles.indexOf(roleId) !== -1) flag = true;

  if (roleId === 'finance' && (roles.indexOf('GL') !== -1 || roles.indexOf('InterCompany') !== -1 )) flag = true;

  return flag;
};

/**
 * 根据账户，获取所拥有的角色
 * @param accountId
 * @param t
 * @return {Promise.<void>}
 */
exports.getRoles = (accountId, t) => {
  let grant = rbacGrant();
  let roles = [];
  return models.account.findOne({
    where: {id: accountId},
    attributes: ['id'],
    include: [{
      model: models.role,
      attributes: ['id'],
      where: {status: 1},
      required: false
    }],
    transaction: t
  }).then((c_account) => {
    if(!c_account) throw new Error(`3,${accountId}`);
    let initRoles = c_account.roles.map((item) => {
      return item.dataValues.id;
    });
    initRoles.forEach((item) => {
      getUnitRole(item, roles)
    });
    function getUnitRole(roleId, roles) {
      roles.push(roleId);
      grant.grants[roleId].forEach((unit) => {
        if (grant.roles.indexOf(unit) !== -1) {
          getUnitRole(unit, roles)
        }
      })
    }
    return roles.unique();
  });
};

/**
 * 根据角色数组，查出隐藏包含的所有角色
 *
 * @param roles 角色数组 ['general', 'chief']
 */
exports.asyncGetRoles = (roles) => {
  let result = [];
  roles.forEach((item) => {
    getUnitRole(item)
  });
  function getUnitRole(roleId) {
    roles.push(roleId);
    result = [...result, ...appcfg.ownRoles[roleId]]
  }
  return result.unique();
};


/**
 * 将一个回调函数转化为promise
 *
 * @param fn
 * @param receiver
 * @return {function(...[*])}
 */
const promisify = (fn, receiver) => {
  return (...args) => {
    return new Promise((resolve, reject) => {
      fn.apply(receiver, [...args, (err, res) => {
        return err ? reject(err) : resolve(res);
      }]);
    });
  };
};

exports.promisify = promisify;

//todo getreqparameter方法中可以限定参数的取值范围


/**
 * 处理fsm中钩子函数的错误处理问题
 *
 * @param fsm
 * @param action
 * @return {Promise.<void>}
 */
async function handleFsmError(fsm, action) {
  let args = [];
  for (let i = 2, len = arguments.length; i < len; i++){
    args.push(arguments[i]);
  }
  let err = await fsm[action].apply(fsm, args);
  if (Object.getType(err) === 'error') throw err;
}
exports.handleFsmError = handleFsmError;

/**
 * 判断参数的类别是否符合要求
 *
 * @param arg
 * @param type
 * @return {boolean}
 */
exports.checkArgType = (arg, type) => {
  const regexType = {
    'YYYY-MM': new RegExp('20[0-9][0-9]-[01][0-9]')
  };

  if (type == 'YYYY-MM'){
    if (arg.match(regexType[type])) return true;
  }
  else if (type == 'bankPrefix') {
    let prefixion = arg.slice(0, -9);
    if (appcfg.bankPrefix.hasValue(prefixion)) return true;
  }
  else return false;
};

