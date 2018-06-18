// const
//   StateMachine = require('javascript-state-machine'),
//   config = require('config'),
//   flowCfg = config.flowCfg,
//   {Created, Submitted, FMRefused, FMApproved, CashierPaid, Succeeded, Abandoned} = flowCfg.expenseStatus,
//   {create, submit, financeApprove, financeRefuse, cashierPay, paySucceed, abandon} = flowCfg.expenseOperation,
//   onBeforeTransition = require('./onBeforeTransition')
//
//
// //当前审批状态
// exports.expenseStatus = {
//   Created: 'Created',  //已创建，待提交
//   Submitted: 'Submitted', // 已提交，待财务经理审批
//   FMRefused: 'FMRefused',  //财务经理否决，待提交
//   FMApproved: 'FMApproved',  //财务经理已审核，待出纳付款
//   CashierPaid: 'CashierPaid',  //出纳已付款，待确认付款成功
//   Succeeded: 'Succeeded', // 付款成功
//   Abandoned: 'Abandoned'  //已废弃
// }
//
// //对报销单的操作
// exports.expenseOperation = {
//   create: 'create',//创建
//   submit: 'submit',//提交
//   financeApprove: 'financeApprove',//财务批准
//   financeRefuse: 'financeRefuse',//财务拒绝
//   cashierPay : 'cashierPay', // 出纳付款
//   paySucceed : 'paySucceed', // 出纳确认付款成功
//   abandon : 'abandon', // 废弃
// };
//
//
// const transitions = [
//   { name: create,  from: ['none', Created],  to: Created},
//   { name: submit,  from: [Created, FMRefused],  to: Submitted},
//
//   { name: financeApprove, from: Submitted, to: FMApproved},
//   { name: financeRefuse, from: Submitted, to: FMRefused},
//
//   { name: cashierPay, from: FMApproved, to: CashierPaid},
//
//   { name: paySucceed, from: CashierPaid, to: Succeeded},  //流程结束
//
//   { name: abandon, from: [Created, FMRefused], to: Abandoned},  //流程结束
//   { name: 'goto', from: '*', to: function(s) { return s } }
// ];
//
// const ExpenseMachine = StateMachine.factory({
//   transitions,
//
//   data: ($expense, user, t) => {
//     if (!user) throw new Error('请登录')
//     return {$expense, user, t}
//   },
//
//   methods: {
//     init () {
//       this.goto(this.$expense.approStatus)
//       return this
//     },
//
//     /** 初始操作 */
//     onBeforeTransition,
//
//     /** 创建 expense */
//     // onCreate,
//
//   }
// });
//
// exports.ExpenseMachine = ExpenseMachine
// exports.ExpenseTransitions = transitions
