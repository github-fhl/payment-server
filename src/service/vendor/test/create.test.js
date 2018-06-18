const
  {modelPath, cfg} = require('config'),
  {models, sequelize} = require(modelPath),
  should = require('should'),
  expect = require('chai').expect,
  create = require('../create')

let user = {
  id: 'superMan'
}

describe('Vendor Create', async () => {

  before(async () => {
    this.t = await sequelize.transaction()
    await sequelize.sync()
  })

  it('正常创建', async () => {
    let vendor = {
      name: 'vendorTest1',
      code: 'T001',
      vendorType: cfg.user
    }


    
    let $vendor

    try {
      $vendor = await create(vendor, user, this.t)
    }
    catch (err) {
      expect(err).to.be.null
    }
    expect($vendor.name).to.be.eql('vendorTest1')
  })

  it('Code 重复', async () => {
    let vendor = {
      name: 'vendorTest2',
      code: 'T001',
      vendorType: cfg.user
    }

    let $vendor

    try {
      $vendor = await create(vendor, user, this.t)
    }
    catch (err) {
      expect(err.message).to.be.eql(`Vendor Code - ${vendor.code} 已存在！`)
    }
  })

  after(async () => {
    await this.t.rollback()
  })
})

