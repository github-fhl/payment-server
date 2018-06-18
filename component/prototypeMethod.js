/**
 * 移除数组中的相同元素
 *
 * @returns {array} 返回处理后的数组
 *
 * @example
 *
 * [1,2,3,1,2].unique();
 * //=> [1,2,3]
 * */


function unique() {
  let temArr = [];
  this.forEach((item)=>{
    if (!(temArr.indexOf(item) + 1)) {
      //indexOf无法判断NaN的情况
      if (Number.isNaN(item)){
        if (!temArr.hasAttr(NaN)) temArr.push(item)
      }else temArr.push(item)
    }
  });
  return temArr
}
Array.prototype.unique = unique;

/**
 * 判断数组中是否存在某个指定的元素
 *
 * @returns {boolean} 返回布尔值
 *
 * @example
 *
 * [1,2,3,1,2,NaN].hasAttr(NaN);
 * //=> true
 * */


function ArrHasAttr(attr) {
  //判断NaN
  if (Number.isNaN(attr)){
    for (let i = 0, len = this.length; i < len; i++) {
      if (Number.isNaN(this[i])) {
        return true
      }
    }
  }
  //判断空数组[]
  if (Object.getType(attr) === 'array' && attr.length === 0){
    for (let i = 0, len = this.length; i < len; i++) {
      if (Object.getType(attr) === 'array' && attr.length === 0) {
        return true
      }
    }
  }
  //普通元素
  if (this.indexOf(attr) + 1){
    return true
  }
  return false
}
Array.prototype.hasAttr = ArrHasAttr;

/**
 *在mainArr中移除diffArr的元素，差集
 *
 * @param {Array} diffArr 移除元素的来源数组
 * @example
 *
 * [1,2,3].remove([2]);
 * //=>[1,3]
 */

function remove(diffArr) {
  if (this == null && diffArr == null){
    throw new Error('请填写一个主参数')
  }
  if (diffArr == null){
    return this
  }
  let result = this.filter((item)=>{
    //处理NaN的情况
    if (Number.isNaN(item)){
      if (diffArr.hasAttr(NaN)) return false;
      return true
    }
    //处理空数组的情况
    if (Object.getType(item) === 'array' && item.length == 0){
      if (diffArr.hasAttr([])) return false;
      return true
    }
    return !(diffArr.indexOf(item) + 1)
  });
  return result
}

Array.prototype.remove = remove;


/**
 * js自带的toFixed方法，采用的是四舍六入五成双方法，对于普通用户十分诡异，而且返回的是一个字符串
 * 所以写一个简单的处理方法
 *
 * @param {number} fractionDigits=2 保留有效数字
 * @returns {number} 返回处理后的数字
 *
 * @example
 *
 * 1.234.simpleFixed(2);
 * //=> 1.23
 */

function simpleFixed(fractionDigits = 2) {
  let temp = this > 0 ? (this * Math.pow( 10, fractionDigits ) + 0.5) : (this * Math.pow( 10, fractionDigits ) - 0.5);
  return parseInt(temp)/Math.pow(10,fractionDigits);
}

Number.prototype.simpleFixed = simpleFixed;

/**
 * 判断 Object 中是否存在某个值
 *
 * @param attr
 * @return {boolean}
 * @constructor
 */

function ObjHasValue(attr) {
  for (let key in this){
    if (this[key] == attr) return true;
  }
  return false;
}

Object.defineProperty(Object, 'hasValue', {
  value:ObjHasValue,
  enumerable: false
});
