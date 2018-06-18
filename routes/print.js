const
  common = require('./../component/common')
  , util = require('./../component/util')
  , tools = require('./../component/tools')
  , appcfg = require('./../component/appcfg')
  , {cashierAppro, financeAppro} = appcfg.operation
  , models  = require('../models').models
  , dl = require('debug')('paytype:log')
  , de = require("debug")('paytype:error')
  , sequelize  = require('../models').sequelize
  , Sequelize  = require('../models').Sequelize
  , fn = require('../component/fn')
  , decorateCondition = fn.decorateCondition
  , rbac=require('../component/accesscheck').rbac
  , ejs = require('ejs')
  , config = require('config')
  , ejs1 = require('../views/paymentOrder.ejs')
  , moment = require('moment')
  , Excel = require('exceljs')
  , mkdirRecursion = tools.mkdirRecursion
  , {v1} = require('uuid')
  , path = require('path')
  , mainPath = path.join(require.main.filename, '..')
  , {randomSignature} = require('./signature')
  ;

/**
 * 打印 order
 * 规则
 *    1、只能打印 company 类型的 order
 *
 *
 * @param req
 * @param res
 */
exports.paymentOrder = (req, res) => {
  let run = async() => {
    let args = {};
    if (
      common.getreqparameter(req, res, args, 'orderId', true)
    ){
      return await sequelize.transaction( async (t) => {
        let c_order = await models.order.findOne({
          where: {id: args.orderId},
          transaction: t,
          include: [{
            model: models.orderdetail,
            include: [{
              model: models.paytype
            }, {
              model: models.company,
              attributes: ['name']
            }, {
              model: models.vendor,
              attributes: ['name']
            }, {
              model: models.reimuser,
              attributes: ['name']
            }],
            where: {status: 1},
            required: false
          },{
            model: models.applylog
          },{
            model: models.company,
            attributes: ['logoPath']
          }]
        });
        if (!c_order) throw new Error(`3,${args.orderId}`);
        if (c_order.orderdetails.length === 0) throw new Error(1002);
        let c_account = await models.account.findOne({
          where: {id: c_order.dataValues.createdUsr},
          transaction: t
        });

        // 获取 logo path
        let logoPath = c_order.company.dataValues.logoPath;

        let picUrl = {}, date = {};
        // 获得签名
        let random;
        for (let i = 0, len = c_order.applylogs.length; i < len; i++){
          let item = c_order.applylogs[i].dataValues;
          let c_signatures = await models.signature.findAll({
            where: {accountId: item.operator},
            transaction: t
          });
          let path;
          if (c_signatures.length == 0) {
            // throw new Error(`1003,${item.operator}`);
            path = '';
          }else{
            random = tools.selectfrom(0,c_signatures.length-1);
            path = c_signatures[random].dataValues.path;
          }
          let operationDate = moment(item.createdAt).format('YYYY-MM-DD');
          switch (item.operation){
            case appcfg.operation.create:
              picUrl.applicant = path;
              date.applicant = operationDate;
              break;
            case appcfg.operation.managerAppro:
              picUrl.manager = path;
              date.manager = operationDate;
              break;
            case appcfg.operation.financeAppro:
              picUrl.finance = path;
              date.finance = operationDate;
              break;
            case appcfg.operation.chiefAppro:
              picUrl.chief = path;
              date.chief = operationDate;
              break;
          }
        }
        c_order.printStatus = appcfg.y;
        await c_order.save({transaction: t});

        let result = {
          serverurl: config.serverurl,
          orderId: args.orderId,
          applicant: c_account.id,
          department: c_account.department,
          telephoneNumber: c_account.telephoneNumber,
          vendorType: c_order.dataValues.vendorType,
          amount: c_order.dataValues.amount.simpleFixed(2),
          contacter: c_order.orderdetails[0].vendor.name,
          bankNum: c_order.orderdetails[0].dataValues.bankNum,
          bankName: c_order.orderdetails[0].dataValues.bankName,
          description: c_order.dataValues.description,
          details: c_order.orderdetails,
          currency: c_order.dataValues.currency,
          picUrl: picUrl,
          date: date,
          logoPath: logoPath,
        }

        if (c_order.dataValues.vendorType !== appcfg.vendorType.company) {
          result = {
            ...result,
            contacter: null,
            bankNum: null,
            bankName: null,
          }
        }

        console.log('details: ', JSON.parse(JSON.stringify(result.details)))
        return result

      });
    }
  };
  run().then( (data)=> {
    // res.json({info: data})
    common.resrender(req, res, 'paymentOrder', data)
  }).catch(common.catchsendmessage(req, res))
};


const getVoucher = async (orderId, voucherDate, vendorCode, userId, t) => {
  let c_order = await models.order.findOne({
    where: {id: orderId},
    transaction: t,
    include: [{
      model: models.ordersubject,
      include: [{
        model: models.subject
      }],
      where: {status: 1},
      required: false,
      separate: true,
      order: 'type ASC'
    },{
      model: models.company,
      attributes: ['logoPath']
    },{
      model: models.orderdetail,
      where: {status: 1},
      required: false,
      include: [{
        model: models.vendor
      }]
    }, {
      model: models.applylog,
      where: {
        operation: {$in: [cashierAppro, financeAppro]}
      },
      required: false,
      separate: true,
      order: 'createdAt DESC',
      include: [{
        model: models.account,
        as: 'Operator',
        include: [{
          model: models.signature
        }]
      }]
    }]
  });

  if (!c_order) throw new Error(`3,${orderId}`);
  if (c_order.ordersubjects.length === 0) throw new Error(1004);
  if (c_order.orderdetails.length === 0) throw new Error(1002);

  c_order.voucherDate = voucherDate;
  c_order.save({transaction: t});

  let creditCode, details = [], sumMoney = 0;
  c_order.ordersubjects.forEach((item) => {
    if (item.dataValues.type === appcfg.subjectType.credit) {
      creditCode = item.subject.dataValues.code;
    }else{
      details.push(item);
      sumMoney += item.money;
    }
  });

  // 个人类别的 payment 不需要 vendorCode、name
  // 公司类别需要根据 code 更新对应的 vendor
  let vendorName = null

  if (c_order.vendorType === appcfg.vendorType.company) {
    vendorCode = vendorCode || c_order.orderdetails[0].vendor.dataValues.code;
    vendorName = c_order.orderdetails[0].vendor.dataValues.name;
    c_order.orderdetails[0].vendor.code = vendorCode;
    await c_order.orderdetails[0].vendor.save({transaction: t});
  }
  else {
    vendorCode = null
  }

  // 获取 logo path
  let logoPath = c_order.company.dataValues.logoPath;
  let date = moment(voucherDate);
  let paidNo = c_order.dataValues.paidNo;

  // 获取签名
  // let operators = {};
  // c_order.applylogs.forEach(log => {
  //   operators[log.operation] = log.operator
  // });

  let financePath, cashierPath, enterPath;
  let operations = [financeAppro, cashierAppro];
  operations.forEach(operation => {
    for (let log of c_order.applylogs) {
      if (log.operation === operation) {
        if (operation === financeAppro) financePath = randomSignature(log.Operator.signatures);
        if (operation === cashierAppro) cashierPath = randomSignature(log.Operator.signatures);
        break;
      }
    }
  });

  let c_signatures = await models.signature.findAll({
    where: {accountId: userId, status: 1},
    transaction: t
  });
  enterPath = randomSignature(c_signatures);

  let applylogs = c_order.applylogs;

  return {
    logoPath, creditCode, details, vendorCode, vendorName, date, paidNo, sumMoney, financePath, cashierPath, enterPath, applylogs
  }
};

/***
 * 打印
 * 规则：
 *    在
 *
 * @param req
 * @param res
 */
exports.paymentVoucher = (req, res) => {

  let run = async() => {
    let args = {};
    if (
      common.getreqparameter(req, res, args, 'orderId', true) &&
      common.getreqparameter(req, res, args, 'voucherDate', true) &&
      common.getreqparameter(req, res, args, 'vendorCode', true)
    ) {
      return await sequelize.transaction( async (t) => {

        let {logoPath, creditCode, details, vendorCode, vendorName, date, paidNo, sumMoney, financePath, cashierPath, enterPath} = await getVoucher(args.orderId, args.voucherDate, args.vendorCode, req.user.id, t);
        return {
          logoPath,
          creditName: creditCode,
          details,
          vendorCode,
          vendorName,
          year: date.format('YYYY'),
          month: date.format('MM'),
          day: date.format('DD'),
          paidNo: paidNo,
          sumMoney,
          financePath,
          cashierPath,
          enterPath
        }
      })
    }
  };
  run().then( (data)=> {
    // res.json({info: data})
    common.resrender(req, res, 'paymentVoucher', data)
  }).catch(common.catchsendmessage(req, res))
};


exports.exportVoucher = (req, res) => {
  let args = {};
  if (
    common.getreqparameter(req, res, args, 'orderId', true) &&
    common.getreqparameter(req, res, args, 'voucherDate', true) &&
    common.getreqparameter(req, res, args, 'vendorCode', true)
  ){
    let run = async () => {

      let {logoPath, creditCode, details, vendorCode, vendorName, date, paidNo, sumMoney, financePath, cashierPath, enterPath} = await getVoucher(args.orderId, args.voucherDate, args.vendorCode, req.user.id);

      let workbook = new Excel.Workbook();
      await workbook.xlsx.readFile(`${mainPath}/public/temp/voucher.xlsx`);


      let worksheet = workbook.getWorksheet(1);

      // 增加 logo
      let logoId = workbook.addImage({
        filename: `${mainPath}/public/${logoPath}`,
        extension: path.extname(logoPath).split('.')[1]
      });

      worksheet.addImage(logoId, 'I1:I6');

      // 录入数据
      let creditCodeCell = worksheet.getCell('B7');
      creditCodeCell.value += creditCode;
      let vendorNameCell = worksheet.getCell('B9');
      if (vendorName) vendorNameCell.value += vendorName;
      let vendorCodeCell = worksheet.getCell('B10');
      if (vendorCode) vendorCodeCell.value += vendorCode;
      let paidNoCell = worksheet.getCell('I7');
      paidNoCell.value += paidNo;
      let paidDate = worksheet.getCell('D9');
      paidDate.value = `日期：  ${date.format('YYYY')}年  ${date.format('MM')}月  ${date.format('DD')}日`;


      let startLineNum = 13,
        lineNum = 14,
        endColNum = 19;

      let targetRow = worksheet.getRow(14);
      for(let detail of details) {
        let row = worksheet.getRow(lineNum);

        let descriptionCell = row.getCell(2);
        descriptionCell.value = detail.description;
        let subjectCodeCell = row.getCell(7);
        subjectCodeCell.value = detail.subject.code;
        let subjectDescriptionCell = row.getCell(8);
        subjectDescriptionCell.value = detail.subject.name;
        let moneyCell = row.getCell(9);
        moneyCell.value = detail.money;


        // insertMoney(row, detail.money, endColNum);

        if (lineNum - startLineNum === details.length) break;
        lineNum++;
        worksheet.addRow({id: lineNum});

        let newRow = worksheet.getRow(lineNum);
        newRow.height = 35;
        newRow.commit();
        worksheet.mergeCells(`${newRow.getCell(2).address}:${newRow.getCell(6).address}`);
        for (let i = 2; i <= 18; i++) {
          newRow.getCell(i).style = targetRow.getCell(i).style;
        }
      }

      // 创建合计栏
      worksheet.addRow();
      let sumRow = worksheet.lastRow;
      sumRow.height = 35;
      worksheet.mergeCells(`${sumRow.getCell(2).address}:${sumRow.getCell(8).address}`);

      for (let i = 2; i <= 18; i++) {
        sumRow.getCell(i).style = targetRow.getCell(i).style;
      }
      let sumCell = sumRow.getCell(2);
      sumCell.alignment = {
        vertical: 'middle',
        horizontal: 'left'
      };
      sumCell.value = '合计 Total';
      let moneyCell = sumRow.getCell(9);
      moneyCell.value = sumMoney;
      // insertMoney(sumRow, sumMoney, endColNum);

      // 添加 ￥ 符号
      // let _money = (sumMoney * 100).toFixed(0);
      // sumRow.getCell(endColNum - _money.length - 1).value = '¥'

      // 创建签名栏
      worksheet.addRow();
      worksheet.addRow();

      ['cn', 'en'].forEach(type => {

        worksheet.addRow();
        let row = worksheet.lastRow;
        let targetCell = type === 'cn' ? worksheet.getCell('B7') : worksheet.getCell('B8');

        let cellInfos = [
          {index: 2, cn: '出纳：', en: 'Cashier'},
          {index: 6, cn: '记账：', en: 'Entered'},
          {index: 8, cn: '审核：', en: 'Approved'},
        ];

        cellInfos.forEach(cellInfo => {

          let cell = row.getCell(cellInfo.index);
          cell.style = targetCell.style;
          cell.value = type === 'cn' ? cellInfo.cn : cellInfo.en;
        });

      });

      // 插入签名图片
      // 先隐藏，如果有需要再启动
      // [[cashierPath, 'C19:D21'], [enterPath, 'G19:G21'], [financePath, 'L19:R21']].forEach(item => {
      //
      //   let itemId = workbook.addImage({
      //     filename: `${mainPath}/public/${item[0]}`,
      //     extension: path.extname(item[0]).split('.')[1]
      //   });
      //
      //   worksheet.addImage(itemId, item[1]);
      // })

      let dir = `${mainPath}/public/download/${moment().format('YYYYMMDD')}`;
      mkdirRecursion(dir);
      let filePath = `${dir}/${paidNo}.xlsx`;
      await workbook.xlsx.writeFile(filePath);
      return `${filePath.split('public/')[1]}`
    };

    run()
      .then( (path)=> {
        common.ressendsuccess(req, res, {path})
      })
      .catch(common.catchsendmessage(req, res))
  }
};

function insertMoney(row, money, endColNum) {
  let _money = (money * 100).toFixed(0);
  for (let i = 0; i <= _money.length; i++) {
    row.getCell(endColNum - (_money.length - i)).value = _money[i]
  }
}

async function getBankInfo(orderId, t) {
  let $order = await models.order.findOne({
    where: {id: orderId},
    transaction: t,
    include: [{
      model: models.ordersubject,
      where: {type: appcfg.subjectType.credit, status: 1},
      required: false,
      include: [{
        model: models.subject
      }]
    }, {
      model: models.orderdetail,
      where: {status: 1},
      required: false,
      include: [{
        model: models.company
      }, {
        model: models.vendor
      }]
    }]
  });

  if ($order.ordersubjects.length === 0) throw new Error(`该 order ${$order.id}没有对应的付款银行`);

  let
    TransactionType = ['LTR', 1],
    BeneficiaryCode = ['CN', 2],
    DebitAccountNumber = [$order.ordersubjects[0].subject.bankNum, 3],

    PaymentCurrency = ['CNY', 5],
    ValueDate = [moment($order.paidDate).format('MM/DD/YYYY'), 9],
    Charges = ['OUR', 10],
    BeneficiaryBankAddressLine1 = ['支行', 15],
    CompanyAddress = ['Shanghai,China', 52];

  return $order.orderdetails.map($orderdetail => {
    return {
      TransactionType,
      BeneficiaryCode,
      DebitAccountNumber,
      PayerName: [$orderdetail.company.name, 4],
      PaymentCurrency,
      TransactionAmount: [$orderdetail.money, 6],
      ValueDate,
      Charges,
      BeneficiaryBankName: [$orderdetail.bankName, 14],
      BeneficiaryBankAddressLine1,
      BeneficiaryName: [$orderdetail.vendor.name, 18],
      BeneficiaryAccountNumber: [$orderdetail.bankNum, 22],
      PaymentDetails1: [$orderdetail.remark, 23],
      CompanyAddress
    }
  });
}

// 导出银行模板
exports.exportBankInfo = (req, res) => {
  let run = async() => {
    let args = {};
    if (
      common.getreqparameter(req, res, args, 'orderIdArr', true)
    ) {
      return await sequelize.transaction( async (t) => {
        let orderIdArr = JSON.parse(args.orderIdArr);

        let workbook = new Excel.Workbook();
        await workbook.xlsx.readFile(`${mainPath}/public/temp/exportBankInfo.xlsx`);

        let worksheet = workbook.getWorksheet(1);

        // 写入数据
        for (let i = 0; i < orderIdArr.length; i++) {
          let orderId = orderIdArr[i];
          let details = await getBankInfo(orderId, t);
          details.forEach(detail => {
            worksheet.addRow();
            let newRow = worksheet.lastRow;

            Object.values(detail).forEach(item => {
              newRow.getCell(item[1]).value = item[0];
            })
          })
        }

        let dir = `${mainPath}/public/download/${moment().format('YYYYMMDD')}/bankInfo`;
        mkdirRecursion(dir);
        let filePath = `${dir}/${v1()}.xlsx`;
        await workbook.xlsx.writeFile(filePath);
        return `${filePath.split('public/')[1]}`
      })
    }
  };
  run().then( (data)=> {
    common.ressendsuccess(req, res, {path: data})
  }).catch(common.catchsendmessage(req, res))
};


/**
 * 在打印凭证、导出凭证时，需要 check 输入的 code
 * 1. 该 code 与对应的 vender 的 code 是否一致
 * 2. 该 code 如果有变动，那么检查该 code 是否存在其余 vendor 在使用，如果存在则报提醒
 *
 */
exports.checkVendorCode = (req, res) => {

  let run = async() => {
    let args = {};
    if (
      common.getreqparameter(req, res, args, 'vendorId', true) &&
      common.getreqparameter(req, res, args, 'vendorCode', true)
    ) {
      return await sequelize.transaction( async (t) => {
        let $vendor = await models.vendor.findOne({
          where: {id: args.vendorId},
          transaction: t
        })

        if ($vendor.code === args.vendorCode) return

        let $vendorWithCodes = await models.vendor.findAll({
          where: {code: args.vendorCode},
          transaction: t
        })

        if ($vendorWithCodes.length !== 0) {
          let vendorNames = ''
          $vendorWithCodes.forEach(($vendor, index) => {
            if (index !== 0) vendorNames += '、'
            vendorNames += `${$vendor.name}`
          })
          
          throw new Error(`${vendorNames} 已使用 ${args.vendorCode}`)
        }
        
      })
    }
  };
  run().then( ()=> {
    common.ressendsuccess(req, res)
  }).catch(common.catchsendmessage(req, res))
}
