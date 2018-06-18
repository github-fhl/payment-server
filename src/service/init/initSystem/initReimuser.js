const
  {modelPath, cfg} = require('config'),
  {publicCost, others} = cfg,
  {models} = require(modelPath)

let reimusers = [
  [
    {id: '24941090-06da-11e7-b23d-513f39f5849c',name: 'Robet', companyId: '24787240-06da-11e7-b23d-513f39f5849c'},
    [
      {paytypeId: 'Freelancer', paytypedetailId: 'Freelancer - In house', money: 1000, validDate: '2017-02', vendordetailId: '69b6a690-0eca-11e7-8881-5f624753c8ec'},
      {paytypeId: 'Medical', paytypedetailId: 'Medical Insurance', money: 3000, validDate: '2017-02', vendordetailId: '69b769e0-0eca-11e7-8881-5f624753c8ec'},
      {paytypeId: 'Intern', money: 3000, validDate: '2017-02', vendordetailId: '69b769e0-0eca-11e7-8881-5f624753c8ec'},
    ]
  ],[
    {id: '24a6ae30-06da-11e7-b23d-513f39f5849c',name: 'Blues', companyId: '24787241-06da-11e7-b23d-513f39f5849c'},
    [
      {paytypeId: 'Recruitment Fee', paytypedetailId: 'External', money: 1000, validDate: '2017-02', vendordetailId: '69b6a690-0eca-11e7-8881-5f624753c8ec'},
      {paytypeId: 'Travel', paytypedetailId: 'Travel Taxi', money: 3000, validDate: '2017-02', vendordetailId: '69b769e0-0eca-11e7-8881-5f624753c8ec'},
    ]
  ],[
    {id: '56a6ae30-06da-11e7-b23d-513f39f5849c',name: publicCost, companyId: '24787240-06da-11e7-b23d-513f39f5849c'},
    []
  ],[
    {id: '10a6ae30-06da-11e7-b23d-513f39f5849c',name: others, companyId: '24787240-06da-11e7-b23d-513f39f5849c'},
    []
  ]
];

module.exports = async function (t) {
  for (let i = 0, len = reimusers.length; i < len; i++){
    let reimuser = await models.reimuser.create(reimusers[i][0], {transaction: t});
    reimusers[i][1].forEach((item)=>{
      item.reimuserId = reimuser.id
    });
    await models.reimuserdetail.bulkCreate(reimusers[i][1], {transaction: t});
  }
}
