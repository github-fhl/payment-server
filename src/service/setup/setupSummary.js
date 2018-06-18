const {models} = require('../../../models');
module.exports = async function setupSummary() {
  let companys = await getCompany();
  let vendors = await getVendor();
  let subjects = await getSubject();
  let paytypes = await getPaytype();
  let reimuser = await getReimusers();
  return {companys, vendors, subjects, paytypes, reimuser};
}

async function getCompany() {
  return await models.company.findAll({
    attributes: ['id', 'name'],
    nest: true,
  });
}

async function getVendor() {
  return await models.vendor.findAll({
    attributes: ['id', 'name', 'contacter', 'telphone'],
    include: [{
      model: models.vendordetail,
      attributes: ['id', 'bankNum', 'bankName']
    }],
    nest: true
  });
}

async function getSubject() {
  return await models.subject.findAll({
    attributes: ['id', 'name', 'code', 'bankFlag', 'bankNum', 'currency'],
    nest: true,
  })

}

async function getPaytype() {
  return await models.paytype.findAll({
    attributes: ['id', 'category', 'description'],
    include: [{
      model: models.paytypedetail,
      attributes: ['id', 'description'],
      order: [['rankNum', 'ASC']],
    }],
    nest: true
  })
}

async function getReimusers() {
  return await models.reimuser.findAll({
    attributes: ['id', 'name', 'companyId'],
    nest: true
  })
}
