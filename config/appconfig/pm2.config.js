/* eslint-disable */
const path = require('path')

module.exports = {
  apps : [{
    name        : "payment_service",  // 项目名
    script      : path.join(__dirname, "../../app.js"),
    watch       : false,

    log_file    : "./log/pm2/payment.combined",
    error_file  : "./log/pm2/payment.errs",
    out_file    : "./log/pm2/payment.logs",
    log_date_format : "YYYY-MM-DD HH:mm:ss",

    env: {
      "NODE_ENV": "production",
    }
  }]
}
