moment = require('moment')

#重载date的tojson方法，防止向前端传递格林威治时间
#todo 将方法改为不可枚举
Date::toJSON = ()->
  moment(this).format()


Array::S=String.fromCharCode(2)
Array::in_array=(e)->
  r=new RegExp(this.S+e+this.S);
  return (r.test(this.S+this.join(this.S)+this.S))

Array::removeempty = ->
  output = []
  (output.push(item) if item) for item in @
  output

Array::remove = (val) ->
  index = this.indexOf(val)
  if (index > -1)
    this.splice(index, 1)

Uint8Array::concat = () ->
  length = this.length
  offset = length
  ret=0
  Array.prototype.forEach.call(arguments, (array)->
    length += array.length
  )
  ret = new this.constructor(length);
  ret.set(this);
  Array.prototype.forEach.call(arguments, (array)->
    ret.set(array, offset)
    offset += array.length
  )
  return ret;

#建议使用es6中的startsWith
String::startWith = (str) ->
  return false  if not str? or str is "" or @length is 0 or str.length > @length
  if @substr(0, str.length) is str
    return true
  else
    return false
  true

#建议使用es6中的endsWith
String::endWith = (str) ->
  return false  if not str? or str is "" or @length is 0 or str.length > @length
  if @substring(@length - str.length) is str
    return true
  else
    return false
  true

#识别数据类型
getType = (data) ->
  return 'null' if data == null
  type = typeof data
  return type if type != 'object'
  typeArr = [Date, Array, RegExp, Error, Object]
  for v in typeArr
    return v.name.toLowerCase() if data instanceof v

Object.defineProperty(Object, 'getType', {
  value:getType
  enumerable: false
})

exports.getType = getType;
