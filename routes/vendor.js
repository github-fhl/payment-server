const
  common = require('./../component/common')
  , util = require('./../component/util')
  , appcfg = require('./../component/appcfg')
  , models  = require('../models').models
  , dl = require('debug')('vendor:log')
  , de = require("debug")('vendor:error')
  , sequelize  = require('../models').sequelize
  , Sequelize  = require('../models').Sequelize
  , rbac=require('../component/accesscheck').rbac
  , fn = require('../component/fn')
  , decorateCondition = fn.decorateCondition
  , getData = fn.getData
  , Excel = require('exceljs')
  , path = require('path')
  , mainPath = path.join(require.main.filename, '..')
  , uuidv1 = require('uuid/v1')
  ;

//批量获取
exports.getlist = (req, res)=>{
  let run = async ()=>{
    req.body.include = 'vendordetail';
    let condition = common.findlistfromreq(req, res, models.vendor);
    condition.attributes = {exclude: appcfg.removeAttrs.concat(['status'])};
    if (condition.include){
      condition.include.forEach((item)=>{
        fn.createObjOrAddAttribute(item, 'attributes', 'exclude', appcfg.removeAttrs);
        fn.createObjOrAddAttribute(item, 'where', 'status', 1);
      })
    }
    condition.order = [['code', 'ASC']]
    decorateCondition(models.vendor, condition);
    let rows = await models.vendor.findAll(condition);
    return {rows: rows, count: rows.length}
  };
  run().then( (obj)=> common.ressendsuccess(req, res, {vendors: obj.rows,count:obj.count}) )
    .catch(common.catchsendmessage(req, res))
};
//获取单个
exports.get = (req, res)=>{
  let run = async () => {
    let args = {};
    if(common.getreqparameter(req, res, args, 'id', null, true, null)){
      return await getData(models.vendor, {id: args.id}, null, models.vendordetail)
    }
  };
  run().then( (obj)=> common.ressendsuccess(req, res, {vendor: obj}) )
  .catch(common.catchsendmessage(req, res))
};

//更新
/**
 *
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
 * @param res
 */
exports.update = (req, res)=>{
  let run = async () => {
    let args = {};
    if(common.getreqparameter(req, res, args, 'id', null, true, null) &&
      common.getreqparameter(req, res, args, 'code', null, false, null) &&
      common.getreqparameter(req, res, args, 'name', null, false, null) &&
      common.getreqparameter(req, res, args, 'contacter', null, false, null) &&
      common.getreqparameter(req, res, args, 'telphone', null, false, null) &&
      common.getreqparameter(req, res, args, 'vendorType', null, false, null) &&
      common.getreqparameter(req, res, args, 'remark', null, false, null) &&
      common.getreqparameter(req, res, args, 'details', null, false, null)
    ){
      return await sequelize.transaction(async (t)=>{
        let c_vendor = await models.vendor.findOne({
          where:{id: args.id},
          transaction: t,
          include: [{
            model: models.vendordetail,
            required: false,
            where: {status: 1}
          }]
        });
        if (!c_vendor) throw new Error(`3,${args.name}`);

        let $vendor = await models.vendor.findOne({
          transaction: t,
          where: {
            id: {$ne: args.id},
            code: args.code
          }
        })
        if ($vendor) throw new Error(`${$vendor.name} 已使用 ${$vendor.code}`)

        await fn.updateDetailInfo(req, c_vendor.vendordetails, args.details, models.vendordetail, t, updateVendorHandle, args.id);
        for (let key in args) {
          let value = args[key];
          if ((key !== 'id' && key !== 'details') && (value !== null)) {
            c_vendor[key] = value;
          }
          c_vendor.updatedUsr = req.user.id
        }
        await c_vendor.save({transaction: t});
        return await getData(models.vendor, {id: args.id}, t, models.vendordetail)
      })
    }
  };
  run().then( (c_vendor) => common.ressendsuccess(req, res, {vendor: c_vendor}) )
  .catch(common.catchsendmessage(req, res))
};

//删除
exports.delete = (req, res)=>{
  let run = async () => {
    let args = {};
    if(common.getreqparameter(req, res, args, 'id', null, true, null)){
      return await models.vendor.update({status: 0}, {where: {id: args.id}})
    }
  };
  run().then( (obj)=> common.ressendsuccess(req, res, {vendor: obj}) )
  .catch(common.catchsendmessage(req, res))
};

//增加
exports.new = (req, res)=>{
  let run = async () => {
    let args = {};
    let create = async ()=>{
      return await sequelize.transaction(async (t)=>{
        args.createdUsr = req.user.id;
        let vendorId = (await models.vendor.create(args, {transaction: t})).dataValues.id;
        if (args.details.length == 0) throw new Error(507);
        args.details.forEach((item) => {
          item.vendorId = vendorId;
          item.createdUsr = req.user.id;
        });
        await models.vendordetail.bulkCreate(args.details, {transaction: t});
        return await getData(models.vendor, {id: vendorId}, t, models.vendordetail)
      });
    };
    if(
      common.getreqparameter(req, res, args, 'name', null, true, null) &&
      common.getreqparameter(req, res, args, 'code', null, false, null) &&
      common.getreqparameter(req, res, args, 'contacter', null, false, null) &&
      common.getreqparameter(req, res, args, 'telphone', null, false, null) &&
      common.getreqparameter(req, res, args, 'vendorType', null, true, null) &&
      common.getreqparameter(req, res, args, 'remark', null, false, null) &&
      common.getreqparameter(req, res, args, 'details', null, false, null)
    ){
      if(common.isExist(args.name)) {
        await common.checkRepeatId(models.vendor, 'name', args.name);
        return await create()
      }else{
        return await create()
      }
    }
  };
  run().then( (obj)=> common.ressendsuccess(req, res, {vendor: obj}) )
  .catch(common.catchsendmessage(req, res))
};

async function updateVendorHandle(req, targetId, detail) {
  detail.vendorId = targetId;
}


// 获取所有的 vendor code
exports.getAllVendorCode = (req, res) => {
  let run = async () => {
    let $vendors = await models.vendor.findAll({
      attributes: ['code'],
      where: {
        code: {$ne: null}
      }
    });
    // return $vendors;
    return $vendors.map(item => item.code)
  };
  run().then( (codes) => common.ressendsuccess(req, res, {codes}) )
    .catch(common.catchsendmessage(req, res))
};

// 导入 vendor
exports.importVendor = (req, res) => {
  let run = async() => {
    let args = {};
    if (
      common.getreqparameter(req, res, args, 'filePath', true)
    ) {
      return await sequelize.transaction( async (t) => {
        let workbook = new Excel.Workbook();
        await workbook.xlsx.readFile(`${mainPath}/public/${args.filePath}`);

        let worksheet = workbook.getWorksheet(1);
        let vendorList = {}
        let sameName = ''

        worksheet.eachRow(function(row, rowNumber) {
          if (rowNumber !== 1) {
            if (vendorList[row.values[2]]) sameName += row.values[2] + '、'

            vendorList[row.values[2]] = {
              id: uuidv1(),
              name: row.values[2],
              code: row.values[1]
            }
          }
        });

        if (sameName !== '') throw new Error(`重名 ${sameName}`)

        await models.vendor.bulkCreate(Object.values(vendorList), {transaction: t})

        return vendorList
      })
    }
  };
  run().then( (data)=> {
    common.ressendsuccess(req, res, {data})
  }).catch(common.catchsendmessage(req, res))
}
