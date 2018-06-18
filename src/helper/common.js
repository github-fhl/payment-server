const _ = require('lodash'),
  kindOf = require('kind-of'),
  fs = require('fs'),
  path = require('path'),
  nodemailer = require('nodemailer')

const numIncrement = (str, length, flag) => {
  let num = String(parseInt(str) + flag)
  let prefix = ''

  if (num.length < length) {
    let difference = length - num.length

    for (let i = 0; i < difference; i++) {
      prefix += 0
    }
  }

  return prefix + num
}

/**
 * 数字自增
 * @param {string} str 对象
 * @param {integer} flag 增 1 减 -1
 * @return {string}
 */
exports.increment = (str, flag = 1) => {
  if (!_.isString(str)) {
    throw new Error('参数必须是 string')
  }
  let reg = /\d+/g
  let prefix = str.split(reg)
  let num = str.match(reg)
  let result = ''

  num = num.map((i, index) => {
    if (index === num.length - 1) {
      return numIncrement(i, i.length, flag)
    }
    return i
  })

  for (let i of prefix) {
    result += i

    if (num.length !== 0) {
      let j = num.shift()

      result += j
    }
  }

  return result
}

// 绝对空值判断
exports.isEmpty = data => {
  if (['undefined', 'null'].includes(kindOf(data)) || Number.isNaN(data)) return true;
  return false;
}

exports.addUsr = (data, user) => {
  if (!user) throw new Error('请登录')

  if (kindOf(data) === 'object') {
    data.createdUsr = user.id;
    data.updatedUsr = user.id;
  }
  else if (kindOf(data) === 'array') {
    data.forEach(item => exports.addUsr(item, user))
  }
  else throw new Error(`该类型无法增加创建人`)
}

exports.updateUsr = (data, user) => {
  if (!user) throw new Error('请登录')

  if (kindOf(data) === 'object') {
    data.updatedUsr = user.id;
  }
  else if (kindOf(data) === 'array') {
    data.forEach(item => exports.updateUsr(item, user))
  }
  else throw new Error(`该类型无法增加编辑人`)
}

exports.fuzzy = data => {
  return `%${data.split('').join('%')}%`
}


/**
 * 递归创建文件夹，如果存在则不创建
 * 注意 windows 和 linux（posix） 的区别
 * @param {string} destination 文件夹路径
 * @return {null}
 */
exports.mkdirRecursion = destination => {
  if (!fs.existsSync(destination)) {
    let upperDestination = path.parse(destination).dir

    if (!fs.existsSync(upperDestination)) {
      exports.mkdirRecursion(upperDestination)
    }

    fs.mkdirSync(destination)
  }
}

// 发送邮件
exports.sendMail = (to, title, msg) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.mxhichina.com',
    port: 465,
    secure: true,
    auth: {
      user: '',
      pass: '',
    }
  });

  const mailOptions = {
    from: `chengyi.gao<chengyi.gao@loncus.com>`,
    to: to,
    subject: title,
    text: msg,
    // html: wrapperArticles(articles)
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      return console.log(err);
    }

    console.log('邮件已成功发送');
  })
}

