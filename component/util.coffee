request = require('request')
querystring = require('querystring')
url = require('url')
crypto = require('crypto')
config=require('config')
uuid = require('uuid')
require('./protypemethon')
require('./prototypeMethod')
moment = require('moment')
dl = require('debug')('util:log')
de = require('debug')('util:error')
textencoding = require('text-encoding')
Hashids = require("hashids")
validator=require('validator')
http = require('http')


#exports.httpgetfile = (host, path, args, cb)->
#  if exports.isFunction(path)
#    cb=path
#    url=host
#  else
#    url=host + path + '?' + querystring.stringify(args)
#  request.get({
#      url: url,
#    }, (error, response, body) ->
#    if (!error && response.statusCode == 200)
##      if typeof body == 'string' and body.length>0
##        body = JSON.parse(body)
#      cb({status: 'success', body: body})
#    else
#      cb({status: 'failed', body: body})
#  )
exports.httpgetfile=(fileurl,cb)->
  options = {
    host: url.parse(fileurl).host,
    port: 80,
    path: url.parse(fileurl).pathname
  };
  alldata=new Uint8Array()
  try
    http.get(options, (res) ->
      if (res.statusCode == 200)
        res.on('data', (data) ->
          alldata=alldata.concat(data)
    #              alldata=util.arrayBufferConcat(alldata,data)
        ).on('end', () ->
          cb({status: 'success', body: alldata})
        )
      else
        cb({status: 'failed'})
    )
  catch
    cb({status: 'failed'})

exports.httpget = (host, path, args, cb)->
  if exports.isFunction(path)
    cb=path
    url=host
  else
    url=host + path + '?' + querystring.stringify(args)
  request.get({
      url: url,
    }, (error, response, body) ->
    if (!error && response.statusCode == 200)
      if typeof body == 'string' and body.length>0
        body = JSON.parse(body)
      cb({status: 'success', body: body})
    else
      cb({status: 'failed', body: body})
  )

exports.httppost = (host, path, args, cb)->
  if exports.isFunction(args)
    args=path
    cb=args
    url=host
  else
    url=host + path
  request.post({url: url, form: args},
    (err, response, body)->
      if (!err && response.statusCode == 200)
        if typeof body == 'string'  and body.length>0
          body = JSON.parse(body)
        cb({status: 'success', body: body})
      else
        cb({status: 'failed', body: body})
  )


exports.clone = (obj) ->
  if not obj? or typeof obj isnt 'object'
    return obj

  if obj instanceof Date
    return new Date(obj.getTime())

  if obj instanceof RegExp
    flags = ''
    flags += 'g' if obj.global?
    flags += 'i' if obj.ignoreCase?
    flags += 'm' if obj.multiline?
    flags += 'y' if obj.sticky?
    return new RegExp(obj.source, flags)

  newInstance = new obj.constructor()

  for key of obj
    newInstance[key] = exports.clone obj[key]

  return newInstance
exports.arrayBufferConcat = (buffer1,buffer2) ->

  tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength)
  tmp.set(new Uint8Array(buffer1), 0)
  tmp.set(new Uint8Array(buffer2), buffer1.byteLength)
  return tmp.buffer

  length = 0
  buffer = null

  for i of arguments
    buffer = arguments[i]
    length += buffer.byteLength

  joined = new Uint8Array(length)
  offset = 0

  for  i of arguments
    buffer = arguments[i]
    joined.set(new Uint8Array(buffer), offset)
    offset += buffer.byteLength

  return joined.buffer

exports.arrayBufferToString=(buf, callback) ->
  string = textencoding.TextDecoder(textencoding.encoding).decode(buf);
  return string


exports.StringToarrayBuffer=(str, callback) ->
  buffer = textencoding.TextEncoder(textencoding.encoding).encode(str);
  return buffer
#  bb = new Blob([new Uint8Array(buf)])
#  f = new FileReader()
#  f.onload = (e) ->
#    callback(e.target.result)
#  f.readAsText(bb)

removeNulls=(obj)->
  isArray = obj instanceof Array
  for k of obj
    if (obj[k]==null)
      if isArray then obj.splice(k,1) else delete obj[k]
    else if (typeof obj[k]=="object")
      removeNulls(obj[k])


exports.isArray = (v)->
  toString.apply(v) == '[object Array]'

exports.isFunction=(functionToCheck) ->
  getType = {}
  return functionToCheck && getType.toString.call(functionToCheck) == '[object Function]'


#比较两个对象是否完全一样
exports.compare_option=(obj1,obj2)->
  result=[]
  notadd=false
  if exports.isArray(obj1)
    for o in obj1
      notadd=false
      for attrname of obj2
        if exports.isArray(obj2[attrname])
          if o[attrname] not in obj2[attrname]
            notadd=true
            break
        else
          if o[attrname] != obj2[attrname]
            notadd=true
            break
      if not notadd
        result.push(o)
  else
    notadd=false
    for attrname of obj2
      if exports.isArray(obj2[attrname])
        if obj1[attrname] not in obj2[attrname]
          notadd=true
          break
      else
        if obj1[attrname] != obj2[attrname]
          notadd=true
          break
    if not notadd
      result=obj1
  result

#新建用户密码
exports.computepassword=(password)->
  content = password
  console.log(content)
  shasum = crypto.createHash('sha1')
  shasum.update(content)
  d = shasum.digest('hex')

exports.computehashid=(s1,s2)->

  hashids = new Hashids(s1, 0, "abcdefghijklmnopqrstuvwxyz")
  result=hashids.encode(parseInt(s2))
  r1=""
  for r,i in result
    if validator.isInt(r)
      r1+=r
    else
      for char,j in 'abcdefghijklmnopqrstuvwxyz'
        if r==char
#          if j<10
#            j+=30
          r1+=j
          break
  #  console.log(r1)
  return r1

exports.execobjtoarray=(data)->
  result=[]
  if data
    for k,i in data
      result.push(k)
  result
#清除空的数据
exports.remove_empty = (target) ->
  Object.keys(target).map((key) ->
    if (target[key] instanceof Object )
      if(key=='dataValues')
        target=target[ key ]
        exports.remove_empty(target)
      else if ( !Object.keys(target[ key ]).length && typeof target[ key ].getMonth != 'function')
        delete target[ key ]
      else
        exports.remove_empty(target[ key ])
    else if (target[key] == null || typeof target[key] == 'undefined' )
      delete target[ key ]
    else if exports.isArray(target[key])
      target[key]=target[key].removeempty()
  )
  target

#将obj2的内容填充到obj1里去，ignorenull:忽略空值
exports.merge_options=(obj1,obj2,ignorenull=false)->
  obj3={}
  if obj1?
    obj3 = obj1
  #  if obj1?
  #    for attrname of obj1
  #      if(!ignorenull or obj1[attrname]?)
  #        obj3[attrname] = obj1[attrname]
  if obj2?
    for attrname of obj2
      if(!ignorenull or obj2[attrname]?)
        obj3[attrname] = obj2[attrname]
  obj3

exports.md5 = (str) ->
  md5sum = crypto.createHash('md5')
  md5sum.update(str);
  str = md5sum.digest('hex')
  str
PI = Math.PI;
getRad=(d)->
  d*PI/180.0

exports.getFlatternDistance = (lat1, lng1, lat2, lng2)->
  f = getRad((lat1 + lat2) / 2);
  g = getRad((lat1 - lat2) / 2);
  l = getRad((lng1 - lng2) / 2);

  sg = Math.sin(g);
  sl = Math.sin(l);
  sf = Math.sin(f);

  a = 6378137.0;
  fl = 1 / 298.257;

  sg = sg * sg;
  sl = sl * sl;
  sf = sf * sf;

  s = sg * (1 - sl) + (1 - sf) * sl;
  c = (1 - sg) * (1 - sl) + sf * sl;

  w = Math.atan(Math.sqrt(s / c));
  r = Math.sqrt(s * c) / w;
  d = 2 * w * a;
  h1 = (3*r-1)/2/c;
  h2 = (3*r+1)/2/s;

  return d * (1 + fl * (h1 * sf * (1 - sg) - h2 * (1 - sf) * sg));


exports.nativeConvertAscii=(str) ->
  nativecode = str
  ascii = ""
  for code,i in nativecode
    code = Number(nativecode[i].charCodeAt(0));
    if (code > 127)
      charAscii = code.toString(16)
      charAscii = new String("0000").substring(charAscii.length, 4) + charAscii
      ascii += "\\u" + charAscii
    else
      ascii += nativecode[i]

  ascii

exports.asciiConvertNative=() ->
  asciicode = getid("asciicode").value.split("\\u")
  nativeValue = asciicode[0]
  for code,i in asciicode
    code = asciicode[i]
    nativeValue += String.fromCharCode(parseInt("0x" + code.substring(0, 4)))
    if (code.length > 4)
      nativeValue += code.substring(4, code.length)
  nativeValue

exports.str2int=(str)->
  if not isNaN(str)
    parseInt str
  else
    null
exports.str2float=(str)->
  dl(str)
  if not isNaN(str)
    parseFloat str
  else
    null

exports.str2bool=(str)->

  if not isNaN(str)
    str = parseInt str
    if str>=1
      true
    else
      false
  else if typeof str=="string"
    if str.toLowerCase()=='true'
      true
    else if str.toLowerCase()=='false'
      false
  else if typeof str=="boolean"
    return str
  else
    false

exports.str2array=(str,split=',')->
  if typeof str=="string"
    str.split(split)
  else
    []

exports.endWith=(str1, str2)->
  if(str1 == null || str2 == null)
    return false;
  if(str1.length < str2.length)
    return false;
  else if(str1 == str2)
    return true;
  else if(str1.substring(str1.length - str2.length) == str2)
    return true;
  return false;

exports.startWith=(str1, str2)->
  if(str1 == null || str2 == null)
    return false;

  if(str1.length < str2.length)
    return false;
  else if(str1 == str2)
    return true;
  else if(str1.substr(0, str2.length) == str2)
    return true;
  return false;


exports.randArray=(data)->
  arrlen = data.length
  try1 = new Array()
  try1[i] = i for i in [0..arrlen]
  try2 = new Array()
  try2[i] = try1.splice(Math.floor(Math.random() * try1.length),1) for i in [0..arrlen]
  try3 = new Array();

  try3[i] = data[try2[i]] for i in [0..arrlen]
  try3

# 用newkey代替新key
exports.changeobjkey=(obj,key,newkey)->
  if obj
    value=obj[key]
    if value?
      obj[newkey]=obj[key]
      delete obj[key]


exports.createuuid=()->
  id = uuid.v1()
  value = id.toString().replace(new RegExp(/-/g), '')

exports.inttoletter=(intcode)->
  length=intcode.toString().length
  result=""
  for ic in intcode.toString()
    result+=String.fromCharCode(65 + parseInt(ic))
  result.toLowerCase()

exports.urlbuilder=(params=null)->
  result=""
  if params!=null and params!={}
    markadded=false
    for k of params
      if not markadded
        result="?"
        markadded=true
        result+="#{k}=#{params[k]}"
      else
        result+="&#{k}=#{params[k]}"
  return result
