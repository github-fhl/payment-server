https = require('https')
dl = require('debug')('sms:log')
de = require('debug')('sms:error')
querystring = require('querystring')
config=require('../config')
appconfig=require('./appcfg')
common=require('./common')

# ʹ��luosimao���ж�����֤
exports.send=(mobiles,message,cb)->
  if config.smsdebug
    dl("#{mobiles}:#{message}")
    #    common.ressendsuccess(req,res,obj)
    cb()
  postData = {
    mobile:mobiles,
    message:message+appconfig.smssign
  }

  content = querystring.stringify(postData)
  apiKey=config.smsaccount.key
  options = {
    host:'sms-api.luosimao.com'
    path:'/v1/send.json'
    method:'POST'
    auth:"api:key-#{apiKey}"
    agent:false
    rejectUnauthorized : false
    headers:{
      'Content-Type' : 'application/x-www-form-urlencoded'
      'Content-Length' :content.length
    }
  }


  req = https.request(options,(res)->
    res.setEncoding('utf8')
    res.on('data', (chunk) ->
      dl(JSON.parse(chunk))
    )
    res.on('end',()->
      cb()
    )
  )

  req.write(content+'')
  req.end()
