(function() {
  var Hashids, PI, config, crypto, de, dl, getRad, http, moment, querystring, removeNulls, request, textencoding, url, uuid, validator,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  request = require('request');

  querystring = require('querystring');

  url = require('url');

  crypto = require('crypto');

  config = require('config');

  uuid = require('uuid');

  require('./protypemethon');

  require('./prototypeMethod');

  moment = require('moment');

  dl = require('debug')('util:log');

  de = require('debug')('util:error');

  textencoding = require('text-encoding');

  Hashids = require("hashids");

  validator = require('validator');

  http = require('http');

  exports.httpgetfile = function(fileurl, cb) {
    var alldata, options;
    options = {
      host: url.parse(fileurl).host,
      port: 80,
      path: url.parse(fileurl).pathname
    };
    alldata = new Uint8Array();
    try {
      return http.get(options, function(res) {
        if (res.statusCode === 200) {
          return res.on('data', function(data) {
            return alldata = alldata.concat(data);
          }).on('end', function() {
            return cb({
              status: 'success',
              body: alldata
            });
          });
        } else {
          return cb({
            status: 'failed'
          });
        }
      });
    } catch (error1) {
      return cb({
        status: 'failed'
      });
    }
  };

  exports.httpget = function(host, path, args, cb) {
    if (exports.isFunction(path)) {
      cb = path;
      url = host;
    } else {
      url = host + path + '?' + querystring.stringify(args);
    }
    return request.get({
      url: url
    }, function(error, response, body) {
      if (!error && response.statusCode === 200) {
        if (typeof body === 'string' && body.length > 0) {
          body = JSON.parse(body);
        }
        return cb({
          status: 'success',
          body: body
        });
      } else {
        return cb({
          status: 'failed',
          body: body
        });
      }
    });
  };

  exports.httppost = function(host, path, args, cb) {
    if (exports.isFunction(args)) {
      args = path;
      cb = args;
      url = host;
    } else {
      url = host + path;
    }
    return request.post({
      url: url,
      form: args
    }, function(err, response, body) {
      if (!err && response.statusCode === 200) {
        if (typeof body === 'string' && body.length > 0) {
          body = JSON.parse(body);
        }
        return cb({
          status: 'success',
          body: body
        });
      } else {
        return cb({
          status: 'failed',
          body: body
        });
      }
    });
  };

  exports.clone = function(obj) {
    var flags, key, newInstance;
    if ((obj == null) || typeof obj !== 'object') {
      return obj;
    }
    if (obj instanceof Date) {
      return new Date(obj.getTime());
    }
    if (obj instanceof RegExp) {
      flags = '';
      if (obj.global != null) {
        flags += 'g';
      }
      if (obj.ignoreCase != null) {
        flags += 'i';
      }
      if (obj.multiline != null) {
        flags += 'm';
      }
      if (obj.sticky != null) {
        flags += 'y';
      }
      return new RegExp(obj.source, flags);
    }
    newInstance = new obj.constructor();
    for (key in obj) {
      newInstance[key] = exports.clone(obj[key]);
    }
    return newInstance;
  };

  exports.arrayBufferConcat = function(buffer1, buffer2) {
    var buffer, i, joined, length, offset, tmp;
    tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
    tmp.set(new Uint8Array(buffer1), 0);
    tmp.set(new Uint8Array(buffer2), buffer1.byteLength);
    return tmp.buffer;
    length = 0;
    buffer = null;
    for (i in arguments) {
      buffer = arguments[i];
      length += buffer.byteLength;
    }
    joined = new Uint8Array(length);
    offset = 0;
    for (i in arguments) {
      buffer = arguments[i];
      joined.set(new Uint8Array(buffer), offset);
      offset += buffer.byteLength;
    }
    return joined.buffer;
  };

  exports.arrayBufferToString = function(buf, callback) {
    var string;
    string = textencoding.TextDecoder(textencoding.encoding).decode(buf);
    return string;
  };

  exports.StringToarrayBuffer = function(str, callback) {
    var buffer;
    buffer = textencoding.TextEncoder(textencoding.encoding).encode(str);
    return buffer;
  };

  removeNulls = function(obj) {
    var isArray, k, results;
    isArray = obj instanceof Array;
    results = [];
    for (k in obj) {
      if (obj[k] === null) {
        if (isArray) {
          results.push(obj.splice(k, 1));
        } else {
          results.push(delete obj[k]);
        }
      } else if (typeof obj[k] === "object") {
        results.push(removeNulls(obj[k]));
      } else {
        results.push(void 0);
      }
    }
    return results;
  };

  exports.isArray = function(v) {
    return toString.apply(v) === '[object Array]';
  };

  exports.isFunction = function(functionToCheck) {
    var getType;
    getType = {};
    return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
  };

  exports.compare_option = function(obj1, obj2) {
    var attrname, len, m, notadd, o, ref, ref1, result;
    result = [];
    notadd = false;
    if (exports.isArray(obj1)) {
      for (m = 0, len = obj1.length; m < len; m++) {
        o = obj1[m];
        notadd = false;
        for (attrname in obj2) {
          if (exports.isArray(obj2[attrname])) {
            if (ref = o[attrname], indexOf.call(obj2[attrname], ref) < 0) {
              notadd = true;
              break;
            }
          } else {
            if (o[attrname] !== obj2[attrname]) {
              notadd = true;
              break;
            }
          }
        }
        if (!notadd) {
          result.push(o);
        }
      }
    } else {
      notadd = false;
      for (attrname in obj2) {
        if (exports.isArray(obj2[attrname])) {
          if (ref1 = obj1[attrname], indexOf.call(obj2[attrname], ref1) < 0) {
            notadd = true;
            break;
          }
        } else {
          if (obj1[attrname] !== obj2[attrname]) {
            notadd = true;
            break;
          }
        }
      }
      if (!notadd) {
        result = obj1;
      }
    }
    return result;
  };

  exports.computepassword = function(password) {
    var content, d, shasum;
    content = password;
    console.log(content);
    shasum = crypto.createHash('sha1');
    shasum.update(content);
    return d = shasum.digest('hex');
  };

  exports.computehashid = function(s1, s2) {
    var char, hashids, i, j, len, len1, m, n, r, r1, ref, result;
    hashids = new Hashids(s1, 0, "abcdefghijklmnopqrstuvwxyz");
    result = hashids.encode(parseInt(s2));
    r1 = "";
    for (i = m = 0, len = result.length; m < len; i = ++m) {
      r = result[i];
      if (validator.isInt(r)) {
        r1 += r;
      } else {
        ref = 'abcdefghijklmnopqrstuvwxyz';
        for (j = n = 0, len1 = ref.length; n < len1; j = ++n) {
          char = ref[j];
          if (r === char) {
            r1 += j;
            break;
          }
        }
      }
    }
    return r1;
  };

  exports.execobjtoarray = function(data) {
    var i, k, len, m, result;
    result = [];
    if (data) {
      for (i = m = 0, len = data.length; m < len; i = ++m) {
        k = data[i];
        result.push(k);
      }
    }
    return result;
  };

  exports.remove_empty = function(target) {
    Object.keys(target).map(function(key) {
      if (target[key] instanceof Object) {
        if (key === 'dataValues') {
          target = target[key];
          return exports.remove_empty(target);
        } else if (!Object.keys(target[key]).length && typeof target[key].getMonth !== 'function') {
          return delete target[key];
        } else {
          return exports.remove_empty(target[key]);
        }
      } else if (target[key] === null || typeof target[key] === 'undefined') {
        return delete target[key];
      } else if (exports.isArray(target[key])) {
        return target[key] = target[key].removeempty();
      }
    });
    return target;
  };

  exports.merge_options = function(obj1, obj2, ignorenull = false) {
    var attrname, obj3;
    obj3 = {};
    if (obj1 != null) {
      obj3 = obj1;
    }
    if (obj2 != null) {
      for (attrname in obj2) {
        if (!ignorenull || (obj2[attrname] != null)) {
          obj3[attrname] = obj2[attrname];
        }
      }
    }
    return obj3;
  };

  exports.md5 = function(str) {
    var md5sum;
    md5sum = crypto.createHash('md5');
    md5sum.update(str);
    str = md5sum.digest('hex');
    return str;
  };

  PI = Math.PI;

  getRad = function(d) {
    return d * PI / 180.0;
  };

  exports.getFlatternDistance = function(lat1, lng1, lat2, lng2) {
    var a, c, d, f, fl, g, h1, h2, l, r, s, sf, sg, sl, w;
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
    h1 = (3 * r - 1) / 2 / c;
    h2 = (3 * r + 1) / 2 / s;
    return d * (1 + fl * (h1 * sf * (1 - sg) - h2 * (1 - sf) * sg));
  };

  exports.nativeConvertAscii = function(str) {
    var ascii, charAscii, code, i, len, m, nativecode;
    nativecode = str;
    ascii = "";
    for (i = m = 0, len = nativecode.length; m < len; i = ++m) {
      code = nativecode[i];
      code = Number(nativecode[i].charCodeAt(0));
      if (code > 127) {
        charAscii = code.toString(16);
        charAscii = new String("0000").substring(charAscii.length, 4) + charAscii;
        ascii += "\\u" + charAscii;
      } else {
        ascii += nativecode[i];
      }
    }
    return ascii;
  };

  exports.asciiConvertNative = function() {
    var asciicode, code, i, len, m, nativeValue;
    asciicode = getid("asciicode").value.split("\\u");
    nativeValue = asciicode[0];
    for (i = m = 0, len = asciicode.length; m < len; i = ++m) {
      code = asciicode[i];
      code = asciicode[i];
      nativeValue += String.fromCharCode(parseInt("0x" + code.substring(0, 4)));
      if (code.length > 4) {
        nativeValue += code.substring(4, code.length);
      }
    }
    return nativeValue;
  };

  exports.str2int = function(str) {
    if (!isNaN(str)) {
      return parseInt(str);
    } else {
      return null;
    }
  };

  exports.str2float = function(str) {
    dl(str);
    if (!isNaN(str)) {
      return parseFloat(str);
    } else {
      return null;
    }
  };

  exports.str2bool = function(str) {
    if (!isNaN(str)) {
      str = parseInt(str);
      if (str >= 1) {
        return true;
      } else {
        return false;
      }
    } else if (typeof str === "string") {
      if (str.toLowerCase() === 'true') {
        return true;
      } else if (str.toLowerCase() === 'false') {
        return false;
      }
    } else if (typeof str === "boolean") {
      return str;
    } else {
      return false;
    }
  };

  exports.str2array = function(str, split = ',') {
    if (typeof str === "string") {
      return str.split(split);
    } else {
      return [];
    }
  };

  exports.endWith = function(str1, str2) {
    if (str1 === null || str2 === null) {
      return false;
    }
    if (str1.length < str2.length) {
      return false;
    } else if (str1 === str2) {
      return true;
    } else if (str1.substring(str1.length - str2.length) === str2) {
      return true;
    }
    return false;
  };

  exports.startWith = function(str1, str2) {
    if (str1 === null || str2 === null) {
      return false;
    }
    if (str1.length < str2.length) {
      return false;
    } else if (str1 === str2) {
      return true;
    } else if (str1.substr(0, str2.length) === str2) {
      return true;
    }
    return false;
  };

  exports.randArray = function(data) {
    var arrlen, i, m, n, p, ref, ref1, ref2, try1, try2, try3;
    arrlen = data.length;
    try1 = new Array();
    for (i = m = 0, ref = arrlen; 0 <= ref ? m <= ref : m >= ref; i = 0 <= ref ? ++m : --m) {
      try1[i] = i;
    }
    try2 = new Array();
    for (i = n = 0, ref1 = arrlen; 0 <= ref1 ? n <= ref1 : n >= ref1; i = 0 <= ref1 ? ++n : --n) {
      try2[i] = try1.splice(Math.floor(Math.random() * try1.length), 1);
    }
    try3 = new Array();
    for (i = p = 0, ref2 = arrlen; 0 <= ref2 ? p <= ref2 : p >= ref2; i = 0 <= ref2 ? ++p : --p) {
      try3[i] = data[try2[i]];
    }
    return try3;
  };

  exports.changeobjkey = function(obj, key, newkey) {
    var value;
    if (obj) {
      value = obj[key];
      if (value != null) {
        obj[newkey] = obj[key];
        return delete obj[key];
      }
    }
  };

  exports.createuuid = function() {
    var id, value;
    id = uuid.v1();
    return value = id.toString().replace(new RegExp(/-/g), '');
  };

  exports.inttoletter = function(intcode) {
    var ic, len, length, m, ref, result;
    length = intcode.toString().length;
    result = "";
    ref = intcode.toString();
    for (m = 0, len = ref.length; m < len; m++) {
      ic = ref[m];
      result += String.fromCharCode(65 + parseInt(ic));
    }
    return result.toLowerCase();
  };

  exports.urlbuilder = function(params = null) {
    var k, markadded, result;
    result = "";
    if (params !== null && params !== {}) {
      markadded = false;
      for (k in params) {
        if (!markadded) {
          result = "?";
          markadded = true;
          result += `${k}=${params[k]}`;
        } else {
          result += `&${k}=${params[k]}`;
        }
      }
    }
    return result;
  };

}).call(this);
