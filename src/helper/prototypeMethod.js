/**
 * 已给的数字作为结尾，前面用0补齐，构造出指定位数的字符串
 * @param n
 * @param x
 * @returns {string}
 */
Number.prototype.prefix0 = function (n, x = '0') {
  return (Array(n).join(x) + this).slice(-n);
}