common = require('./common')
config = require('../config')
passport = require('./passport')
moment = require('moment')
validator = require('validator')
appconfig = require("./appcfg")
util = require("./util")
uuid=require('uuid')

dl = require("debug")('upload:log')
de = require("debug")('upload:error')
#上传照片
exports.uploadfile = (req, args,cb)->
  uploadtype = appconfig.uploadtype[args.type]
  if(uploadtype)

    nexttasks = []
    paths = []
#    for imgid in args.wechatimgid
    for imgid in args.imgurls
      fileid = uuid.v1()
      path = "#{uploadtype.osspath}#{fileid}.jpg"
      paths.push(path)
      nexttasks.push({actiontype: 500, target: imgid, desc: path, status: 1})
    req.models.task.create(nexttasks, ()->)
    return cb(null,{path: paths})
  else
    return cb(1002)
