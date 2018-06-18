const config = require('config');
const helper = require(config.helperPath);
const {cfg} = config;
const {models, sequelize} = require(config.modelPath);
const _ = require('lodash');
const Excel = require('exceljs');
const moment = require('moment');

module.exports = async args => {
  const orders = await filterOrders(args);
  const workbook = args.type === 'byMonth' ? exportByMonth(orders) : exportByStaff(orders);
  const filePath = await downloadExcel(workbook, args);

  return filePath;
}

// 筛选出对应的申请单, 导出excel
async function filterOrders(args) {
  const opts = {
    where: {
      approStatus: 'paySucceed',
      orderType: cfg.orderType.Expense,
      companyId: args.companyId
    },
    include: [
      {
        model: models.orderdetail,
        where: {
          status: 1,
        },
        include: [
          {
            model: models.reimuser,
            attributes: ['name']
          }
        ]
      }
    ]
  };

  if (!_.isEmpty(args.paytypes)) await assignPayTypeConditions(opts, args.paytypes);
  if (!_.isEmpty(args.reimusers)) {
    opts.include[0].where.reimuserId = args.excludeType ? {$notIn: args.reimusers} : {$in: args.reimusers};
  }

  if (!_.isEmpty(args.excludeReimusers)) {
    opts.include[0].where.reimuserId = {$notIn: args.excludeReimusers}
  }

  opts.where.paidDate = {
    $gte: args.voucherDate.begin,
    $lte: args.voucherDate.end
  };

  let orders = await models.order.findAll(opts);
  orders = orders.map(order => order.toJSON());
  let validatedOrders = [];
  orders.forEach(orderItem => {
    if (orderItem.orderType === 'Payment') {
      orderItem.amount = 0;
      let validatedOrderDetails = [];
      orderItem.orderdetails.forEach(detailItem => {
        if (detailItem.paytypeId === 'COLA' || detailItem.paytypeId === 'HOUSING') {
          orderItem.amount += detailItem.money;
          validatedOrderDetails.push(detailItem);
        }
      })
      if (validatedOrderDetails.length > 0) {
        orderItem.orderdetails = validatedOrderDetails;
        validatedOrders.push(orderItem);
      }
    } else {
      validatedOrders.push(orderItem);
    }
  })
  return validatedOrders;
}

// 事先拿到所有的费用类型, 并分配到前置条件中
async function assignPayTypeConditions(opts, types) {
  const orderDetailOpts = opts.include[0];
  let paytypes = await models.paytype.findAll({
    where: {status: 1},
    attributes: ['id'],
    include: [{
      model: models.paytypedetail,
      where: {status: 1},
      attributes: ['id', 'paytypeId']
    }]
  })

  const mains = [];
  const details = [];
  let endIndex;

  let formattedTypes = [];

  types.forEach(type => {
    endIndex = type.lastIndexOf(', ');
    if (endIndex > 0) {
      type = type.substring(0, endIndex);
    }
    formattedTypes.push(type)
  })

  formattedTypes.forEach(type => {
    paytypes.forEach(paytype => {
      if (paytype.id === type) {
        mains.push(type);
      }
    })
  })

  formattedTypes.forEach(type => {
    paytypes.forEach(paytype => {
      paytype.paytypedetails.forEach(paytypedetail => {
        if (paytypedetail.id === type && (!mains.includes(paytypedetail.paytypeId))) {
          details.push(type);
        }
      })
    })
  })

  if (mains.length > 0) {
    orderDetailOpts.where.paytypeId = {$in: mains};
  }

  if (details.length > 0) {
    orderDetailOpts.where.paytypedetailId = {$in: details};
  }
}

// 按员工导出
function exportByStaff(orders) {
  const basicInfos = [];
  const excelInfos = [];
  const types = [];
  orders.forEach(order => {
    order.orderdetails.forEach(od => {
      const info = {
        id: od.orderId,
        name: od.reimuser.name,
        amount: od.money
      };

      if (od.paytypeId) info.type = od.paytypeId;
      if (od.paytypedetailId) info.type = od.paytypedetailId;
      basicInfos.push(info);
    });
  });

  basicInfos.forEach(binfo => {
    if (!_.find(types, i => i.key === binfo.type)) types.push({
      header: binfo.type,
      key: binfo.type,
      width: 15,
      style: {font: {name: 'Arial'}}
    });
    let staff = _.find(excelInfos, i => i.name === binfo.name);
    if (!staff) {
      staff = {
        name: binfo.name,
        record: {
          [binfo.type]: binfo.amount
        }
      };
      excelInfos.push(staff);
      return;
    }

    if (staff.record.hasOwnProperty(binfo.type)) {
      staff.record[binfo.type] += binfo.amount;
    } else {
      staff.record[binfo.type] = binfo.amount;
    }
  });

  types.sort((prev, next) => prev.key > next.key);
  excelInfos.sort((prev, next) => prev.name > next.name);

  // excel数据生成
  const workbook = new Excel.Workbook();
  const worksheet = workbook.addWorksheet('Sheet1');

  worksheet.columns = [
    {width: 3},
    {header: 'Name', key: 'name', width: 15, style: {font: {name: 'Arial'}}},
    ...types,
    {header: 'Sum', key: 'sum', width: 15, style: {font: {name: 'Arial'}}}
  ];

  excelInfos.forEach(staff => {
    const row = {};
    row.name = staff.name;
    row.sum = 0;
    types.forEach(type => {
      if (staff.record.hasOwnProperty(type.key)) {
        row[type.key] = staff.record[type.key];
        row.sum += staff.record[type.key];
        return;
      }
      row[type.key] = 0;
    });
    worksheet.addRow(row);
  });

  return workbook;
}

function exportByMonth(orders) {
  const basicInfos = [];
  const excelInfos = [];
  const types = [];

  orders.forEach(order => {
    order.orderdetails.forEach(od => {
      const info = {
        id: od.orderId,
        month: moment(order.voucherDate).format('YYYY-MM'),
        amount: od.money
      };

      if (od.paytypeId) info.type = od.paytypeId;
      if (od.paytypedetailId) info.type = od.paytypedetailId;
      basicInfos.push(info);
    });
  });

  basicInfos.forEach(binfo => {
    if (!_.find(types, i => i.key === binfo.type)) types.push({
      header: binfo.type,
      key: binfo.type,
      width: 15,
      style: {font: {name: 'Arial'}}
    });
    let month = _.find(excelInfos, i => i.month === binfo.month);
    if (!month) {
      month = {
        month: binfo.month,
        record: {
          [binfo.type]: binfo.amount
        }
      };
      excelInfos.push(month);
      return;
    }

    if (month.record.hasOwnProperty(binfo.type)) {
      month.record[binfo.type] += binfo.amount;
    } else {
      month.record[binfo.type] = binfo.amount;
    }
  });

  types.sort((prev, next) => prev.key > next.key);
  excelInfos.sort((prev, next) => prev.name > next.name);

  // excel数据生成
  const workbook = new Excel.Workbook();
  const worksheet = workbook.addWorksheet('Sheet1');
  worksheet.columns = [
    {width: 3},
    {header: 'Month', key: 'month', width: 15, style: {font: {name: 'Arial'}}},
    ...types,
    {header: 'Sum', key: 'sum', width: 15, style: {font: {name: 'Arial'}}}
  ];
  excelInfos.forEach(month => {
    const row = {};
    row.month = month.month;
    row.sum = 0;
    types.forEach(type => {
      if (month.record.hasOwnProperty(type.key)) {
        row[type.key] = month.record[type.key];
        row.sum += month.record[type.key];
        return;
      }
      row[type.key] = 0;
    });

    worksheet.addRow(row);
  });

  return workbook;
}

// 输出excel
async function downloadExcel(workbook, args) {
  const dir = `${config.downloaddir}/${moment().format('YYYYMMDD')}`
  helper.common.mkdirRecursion(dir);
  const filePath = `${dir}/${args.voucherDate.begin}-${args.voucherDate.end}-reimuser.xlsx`;
  await workbook.xlsx.writeFile(filePath);
  return `${filePath.split('public/')[1]}`;
}
