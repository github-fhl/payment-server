const
  fs = require('fs'),
  path = require('path');

exports.intersection = function(arr1, arr2) {
  var num1, num2;
  num1 = Math.max.apply(null, [arr1[0], arr2[0]]);
  num2 = Math.min.apply(null, [arr1[1], arr2[1]]);
  if (num2 < num1) {
    return null;
  } else {
    return [num1, num2];
  }
};

exports.searchStr = function(str) {
  var matchstr;
  matchstr = str.split('');
  return matchstr = '%' + matchstr.join('%') + '%';
};

exports.pad0 = function(num, n) {
  var len;
  len = num.toString().length;
  while (len < n) {
    num = '0' + num;
    len++;
  }
  return num;
};

exports.selectfrom = function(lowValue,highValue){
  let choice=highValue-lowValue+1;
  return Math.floor(Math.random()*choice+lowValue);
};


/**
 * 递归创建文件夹，如果存在则不创建
 * 注意 windows 和 linux（posix） 的区别
 * @param {string} destination 文件夹路径
 * @return {null}
 */
exports.mkdirRecursion = destination => {
  if (!fs.existsSync(destination)) {
    let upperDestination = path.parse(destination).dir;

    if (!fs.existsSync(upperDestination)) {
      exports.mkdirRecursion(upperDestination)
    }

    fs.mkdirSync(destination)
  }
};
