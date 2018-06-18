const
  common = require('./../component/common')
  , util = require('./../component/util')
  , appcfg = require('./../component/appcfg')
  , models  = require('../models').models
  , dl = require('debug')('ordersubject:log')
  , de = require("debug")('ordersubject:error')
  , sequelize  = require('../models').sequelize
  , Sequelize  = require('../models').Sequelize
  , fn = require('../component/fn')
  , getData = fn.getData
  , checkArgType = fn.checkArgType
  , decorateCondition = fn.decorateCondition
  , rbac=require('../component/accesscheck').rbac
  ;

//批量获取
exports.getlist = (req, res)=>{
  let run = async ()=>{
    // req.body.include = 'subject';
    let condition = common.findlistfromreq(req, res, models.ordersubject);
    condition.attributes = {exclude: appcfg.removeAttrs.concat(['status'])};
    if (condition.include){
      condition.include.forEach((item)=>{
        fn.createObjOrAddAttribute(item, 'attributes', 'exclude', appcfg.removeAttrs);
        fn.createObjOrAddAttribute(item, 'where', 'status', 1);
      })
    }
    decorateCondition(models.ordersubject, condition);
    let rows = await models.ordersubject.findAll(condition);
    return {rows: rows, count: rows.length}
  };
  run().then( (obj)=> common.ressendsuccess(req, res, {ordersubjects: obj.rows,count:obj.count}) )
    .catch(common.catchsendmessage(req, res))
};
//获取单个
exports.get = (req, res)=>{
  let run = async () => {
    let args = {};
    if(common.getreqparameter(req, res, args, 'id', null, true, null)){
      return await models.ordersubject.findOne({where:{id: args.id}})
    }
  };
  run().then( (obj)=> common.ressendsuccess(req, res, {ordersubject: obj}) )
  .catch(common.catchsendmessage(req, res))
};


//增加
/**
 * 规则：
 *     只有财务才能进行拆分操作
 *     只有出纳付款完成才能进行拆分操作
 *     借与贷的金额需要相等
 *     检查 detail 中是否包含所需字段
 *     更新对应 order 的 subjectStatus 的状态
 *
 *
 * @param req
 * @param res
 */

exports.new = (req, res)=>{
  let run = async () => {
    let args = {};
    let create = async ()=>{
      return await sequelize.transaction(async (t)=>{

        let debitSum = 0, creditSum = 0;
        args.details.forEach((item) => {
          ['type', 'money', 'subjectId'].forEach((key) => {
            if (!item[key]) throw new Error(`6,${key}`);
          });
          item.money = parseFloat(item.money);
          item.orderId = args.orderId;
          switch (item.type) {
            case appcfg.subjectType.debit:
              debitSum += item.money;
              break;
            case appcfg.subjectType.credit:
              creditSum += item.money;
              break;
          }
        });
        if (debitSum !== creditSum) throw new Error(206);
        let c_order = await models.order.findOne({
          where: {id: args.orderId},
          transaction: t,
          include: [{
            model: models.ordersubject,
            where: {status: 1},
            required: false
          }]
        });
        if (!c_order) throw new Error(`3,${args.orderId}`);
        if (c_order.dataValues.approStatus !== appcfg.approStatus.paySucceed) throw new Error(207);
        c_order.subjectStatus = appcfg.y;
        await c_order.save({transaction: t});

        await fn.updateDetailInfo(req, c_order.ordersubjects, args.details, models.ordersubject, t);

        // if (!checkArgType(args.subjectDate, 'YYYY-MM')) throw new Error(`5,subjectDate-${args.subjectDate}`);
        // await models.order.update({subjectDate: args.subjectDate}, {
        //   where: {id: args.orderId},
        //   transaction: t
        // });

        return await getData(models.order, {id: args.orderId}, t, models.orderdetail, models.applylog, models.ordersubject);
      });
    };
    if(
      common.getreqparameter(req, res, args, 'details', null, true, null) &&
      // common.getreqparameter(req, res, args, 'subjectDate', null, true, null) &&
      common.getreqparameter(req, res, args, 'orderId', null, true, null)
    ){
      return await create();
    }
  };
  run().then( (obj)=> common.ressendsuccess(req, res, {order: obj}) )
  .catch(common.catchsendmessage(req, res))
};
