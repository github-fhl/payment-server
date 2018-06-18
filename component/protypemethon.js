(function() {
  var getType, moment;

  moment = require('moment');

  Date.prototype.toJSON = function() {
    return moment(this).format();
  };

  Array.prototype.S = String.fromCharCode(2);

  Array.prototype.in_array = function(e) {
    var r;
    r = new RegExp(this.S + e + this.S);
    return r.test(this.S + this.join(this.S) + this.S);
  };

  Array.prototype.removeempty = function() {
    var i, item, len, output, ref;
    output = [];
    ref = this;
    for (i = 0, len = ref.length; i < len; i++) {
      item = ref[i];
      if (item) {
        output.push(item);
      }
    }
    return output;
  };

  Array.prototype.remove = function(val) {
    var index;
    index = this.indexOf(val);
    if (index > -1) {
      return this.splice(index, 1);
    }
  };

  Uint8Array.prototype.concat = function() {
    var length, offset, ret;
    length = this.length;
    offset = length;
    ret = 0;
    Array.prototype.forEach.call(arguments, function(array) {
      return length += array.length;
    });
    ret = new this.constructor(length);
    ret.set(this);
    Array.prototype.forEach.call(arguments, function(array) {
      ret.set(array, offset);
      return offset += array.length;
    });
    return ret;
  };

  String.prototype.startWith = function(str) {
    if ((str == null) || str === "" || this.length === 0 || str.length > this.length) {
      return false;
    }
    if (this.substr(0, str.length) === str) {
      return true;
    } else {
      return false;
    }
    return true;
  };

  String.prototype.endWith = function(str) {
    if ((str == null) || str === "" || this.length === 0 || str.length > this.length) {
      return false;
    }
    if (this.substring(this.length - str.length) === str) {
      return true;
    } else {
      return false;
    }
    return true;
  };

  getType = function(data) {
    var i, len, type, typeArr, v;
    if (data === null) {
      return 'null';
    }
    type = typeof data;
    if (type !== 'object') {
      return type;
    }
    typeArr = [Date, Array, RegExp, Error, Object];
    for (i = 0, len = typeArr.length; i < len; i++) {
      v = typeArr[i];
      if (data instanceof v) {
        return v.name.toLowerCase();
      }
    }
  };

  Object.defineProperty(Object, 'getType', {
    value: getType,
    enumerable: false
  });

  exports.getType = getType;

}).call(this);
