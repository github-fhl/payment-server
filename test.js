// const {parseOrderExcel, formatParsedOrderExcel, create} = require('./src/service/order');
// const {sequelize} = require('./models');
//
// let run = async (t) => {
//     let parsedResult = await parseOrderExcel("Payment.xlsx", 'company');
//     let formatResult = await formatParsedOrderExcel(parsedResult, 'company');
//     console.info(formatResult)
//     await create(formatResult, formatResult.details, {id: 'superMan'}, t);
// }
// sequelize.transaction(t => run(t))
//     .then((result) => {
//     }).catch(err => {
//     console.info(err);
// })

let a = [1,2,3,4,5,6]

for (let index of a) {
  if (index < 4) continue
  console.log('index: ', index)

}
