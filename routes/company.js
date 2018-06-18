const
  common = require('./../component/common')
  , util = require('./../component/util')
  , appcfg = require('./../component/appcfg')
  , models = require('../models').models
  , dl = require('debug')('company:log')
  , de = require("debug")('company:error')
  , sequelize = require('../models').sequelize
  , Sequelize = require('../models').Sequelize
  , fn = require('../component/fn')
  , getData = fn.getData
  , decorateCondition = fn.decorateCondition
  , rbac = require('../component/accesscheck').rbac
;

//批量获取
exports.getlist = (req, res) => {
  let run = async () => {
    let condition = common.findlistfromreq(req, res, models.company);
    condition.attributes = {exclude: appcfg.removeAttrs.concat(['status'])};
    if (condition.include) {
      condition.include.forEach((item) => {
        fn.createObjOrAddAttribute(item, 'attributes', 'exclude', appcfg.removeAttrs);
        fn.createObjOrAddAttribute(item, 'where', 'status', 1);
      })
    }
    decorateCondition(models.company, condition);
    let rows = await models.company.findAll(condition);
    return {rows: rows, count: rows.length}
  };
  run().then((obj) => common.ressendsuccess(req, res, {companys: obj.rows, count: obj.count}))
    .catch(common.catchsendmessage(req, res))
};
//获取单个
exports.get = (req, res) => {
  let run = async () => {
    let args = {};
    if (common.getreqparameter(req, res, args, 'id', null, true, null)) {
      return await getData(models.company, {id: args.id}, null)
    }
  };
  run().then((obj) => common.ressendsuccess(req, res, {company: obj}))
    .catch(common.catchsendmessage(req, res))
};

//更新
exports.update = (req, res) => {
  let run = async () => {
    let args = {};
    if (common.getreqparameter(req, res, args, 'id', null, true, null) &&
      common.getreqparameter(req, res, args, 'name', null, false, null) &&
      common.getreqparameter(req, res, args, 'code', null, false, null) &&
      common.getreqparameter(req, res, args, 'codeToVoucher', null, false, null) &&
      common.getreqparameter(req, res, args, 'bankNum', null, false, null) &&
      common.getreqparameter(req, res, args, 'telphone', null, false, null) &&
      common.getreqparameter(req, res, args, 'logoPath', null, false, null) &&
      common.getreqparameter(req, res, args, 'remark', null, false, null)
    ) {
      let obj = await models.company.findOne({where: {id: args.id}});

      if (args.code && args.code.length !== 2) throw new Error('公司 Code 只能是两位数')
      for (let key in args) {
        let value = args[key];
        if (key !== 'id') {
          obj[key] = value;
        }
        obj.updatedUsr = req.user.id
      }
      return await obj.save();
    }
  };
  run().then((obj) => common.ressendsuccess(req, res, {company: obj}))
    .catch(common.catchsendmessage(req, res))
};

//删除
exports.delete = (req, res) => {
  let run = async () => {
    let args = {};
    if (common.getreqparameter(req, res, args, 'id', null, true, null)) {
      return await models.company.update({status: 0}, {where: {id: args.id}})
    }
  };
  run().then((obj) => common.ressendsuccess(req, res, {company: obj}))
    .catch(common.catchsendmessage(req, res))
};

//增加
exports.new = (req, res) => {
  let run = async () => {
    let args = {};
    let create = async () => {
      args.createdUsr = req.user.id;
      return await models.company.create(args);
    };
    if (
      common.getreqparameter(req, res, args, 'name', null, true, null) &&
      common.getreqparameter(req, res, args, 'code', null, true, null) &&
      common.getreqparameter(req, res, args, 'codeToVoucher', null, true, null) &&
      common.getreqparameter(req, res, args, 'bankNum', null, false, null) &&
      common.getreqparameter(req, res, args, 'telphone', null, false, null) &&
      common.getreqparameter(req, res, args, 'logoPath', null, false, null) &&
      common.getreqparameter(req, res, args, 'remark', null, false, null)
    ) {
      if (common.isExist(args.name)) {
        await common.checkRepeatId(models.company, 'name', args.name);
        if (args.code.length !== 2) throw new Error('公司 Code 只能是两位数')

        return await create()
      } else {
        return await create()
      }
    }
  };
  run().then((obj) => common.ressendsuccess(req, res, {company: obj}))
    .catch(common.catchsendmessage(req, res))
};