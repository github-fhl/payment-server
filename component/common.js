(function() {
  var DeepAssign, Sequelize, appcfg, clone, common, config, crypto, de, dl, getName, models, moment, nodeExcel, sequelize, util, uuid, validator,
    indexOf = [].indexOf;

  crypto = require('crypto');

  dl = require('debug')('common:log');

  de = require('debug')('common:error');

  config = require('config');

  uuid = require('uuid');

  moment = require('moment');

  util = require('./util');

  validator = require('validator');

  appcfg = require('./appcfg');

  nodeExcel = require('excel-export');

  DeepAssign = require('deep-assign');

  clone = require('clone');

  models = require('../models').models;

  sequelize = require('../models').sequelize;

  Sequelize = require('../models').Sequelize;

  common = require("./../component/common");

  getName = require('./fn').getName;

  exports.errors = {
    //0-100 通用错误
    0: '内部错误',
    1: '命名重复',
    2: '该数据已被删除，无法再次删除',
    3: '该数据不存在',
    4: '您没有该权限，您没有角色',
    5: '数据格式不正确',
    6: '请填写该字段',
    7: '当前数据出错',
    8: '没有填写对应的 id',
    9: '该 detail 数据不属于主数据',
    10: '该字段有重复',
    11: '您没有该权限',
    //101-200 账户相关错误
    101: '登录失败',
    102: '请填写用户名',
    103: '用户不存在',
    104: '请重新登录',
    105: '登录 ldap 失败',
    106: '账户名存在重复',
    107: '该账户已有该角色',
    108: '该分机号已存在',
    109: '对应人员需要拥有主管角色',
    110: '您没有对应的部门主管（总监）人员，请联系管理人员进行添加',
    111: '该用户存在但已被删除，无法重新创建',
    120: '没有权限',
    //201-300 申请单错误
    201: '请填写正确的payeeType',
    202: '员工付款类别必须填写 money、 bankNum、 bankName、 payDate、 paytypeId、 vendorName、 reimuserId、 payeeType 字段，现缺少',
    203: '供应商付款类别必须填写 money、 bankNum、 bankName、 paytypeId、 vendorName、 payeeType 字段，现缺少',
    204: '该员工该月该类型没有报销额度',
    205: '您没有权限查看该申请单',
    206: '借贷请相等',
    207: '只有付款完成的申请单才能拆分科目',
    208: '报销金额超出预算',
    209: 'company 类型的申请单对应的 vendor 必须全部相同',
    210: 'order 只能拥有一种 paytype',
    211: '该申请单已废弃',
    212: '当前状态不能更新申请单',
    213: '该类别的成本中心不能为',
    214: '该类别的成本中心只能为',
    215: '账号有重复',
    216: '请填写该科目的银行代号',
    217: '请填写该科目的银行账户类别',
    218: '金额细则有重复',
    219: '申请单描述有重复',
    220: '申请单已进行凭证制单，无法修改',
    //301-500 申请审批流程错误
    301: '您不是该申请单的创建人员，无法操作该申请单',
    302: '请填写对应的主管',
    303: '员工缺少权限',
    304: '没有对应的申请log，请检查数据库',
    305: '申请单的当前状态无法执行此操作',
    306: '申请单的申请审批人员与当前人员不一致',
    307: '请填写对应的拒绝原因且只能拒绝一个申请单',
    308: '该操作不能批量操作',
    309: '请选择对应的银行科目',
    310: '请填写对应的 paidNo',
    311: '请填写对应的付款时间',
    312: '请检查付款单号的流水号是否漏号跳号',
    313: '请选择银行类别的科目',
    314: '该申请单的付款单号的公司代号错误',
    315: '该申请单的付款单号的账户类别错误',
    316: '该申请单的付款单号的银行代号错误',
    //501-1000 系统设置错误
    501: '新建/更新 的报销额度开始有效期不能早于当前时间',
    502: '新建的报销额度对应的有效期存在相同',
    503: '当前已生效的报销额度的生效期无法修改',
    504: '该付款对象已被撤销',
    505: '最多只能填写两个报销额度',
    506: '该字段必须一致',
    507: '至少填写一条 vendor 详情',
    508: '不能编辑该默认成本中心',
    509: '不能使用该名称',
    //1001-1100 打印错误
    1001: '只能打印 company 类型的 order',
    1002: '该 order 没有 orderdetail',
    1003: '该员工没有签名，请联系系统管理员',
    1004: '该申请单还没有进行科目拆分'
  };

  // 返回错误信息
  exports.ressenderror = function(req, res, errorcode = 0, error) {
    var addmsg, err;
    addmsg = "";
    if (!isNaN(errorcode)) {
      addmsg = error != null ? `--${error}` : "";
      error = exports.errors[errorcode];
    } else {
      error = errorcode;
      errorcode = 0;
    }
    if (util.isFunction(res)) {
      err = new Error(errorcode);
      err.status = errorcode;
      return res(err);
    } else if (res.json) {
      if (!res.finished && !res.sent) {
        res.json({
          status: 'failed',
          msg: `${error}${addmsg}`,
          code: errorcode
        });
        return res.sent = true;
      }
    }
  };

  exports.gologin = function(req, res) {
    var backurl;
    backurl = req.url;
    return res.redirect(`${config.loginpage}?backurl=${backurl}`);
  };

  exports.catchsendcode = function(req, res, code) {
    return function(err) {
      console.log(err);
      return exports.ressenderror(req, res, code);
    };
  };

  //=>启用闭包，作用是变量作用到函数内部,checjhasvalue 检测是否有errcode，返回错误信息
  exports.ormerrhandler = (req, res, checkhasvalue, next) => {
    return function(err, obj) {
      var error, errorcode;
      errorcode = 1;
      if (util.isFunction(checkhasvalue)) {
        next = checkhasvalue;
        checkhasvalue = false;
      } else if (validator.isNumeric(checkhasvalue)) {
        errorcode = checkhasvalue;
        checkhasvalue = true;
      }
      if (err) {
        de(err);
        console.log(err);
        error = true;
      } else if (checkhasvalue) {
        if ((obj != null) && ((obj.constructor === Array && obj.length > 0) || (obj.constructor !== Array && obj !== null))) {
          if (obj.objs != null) {
            if (!obj.objs.length > 0) {
              error = true;
            }
          }
        } else {
          error = true;
        }
      }
      if (error) {
        if (res != null) {
          return exports.ressenderror(req, res, errorcode);
        } else {
          return next(errorcode);
        }
      } else {
        return next(null, obj);
      }
    };
  };

  exports.resrender = function(req, res, view, obj = null) {
    var args;
    //  res=staticobj.res
    args = {};
    //  exports.getreqboolparameter(req,res,args,'json',false,false)
    if (!res.finished && !res.sent) {
      if (config.renderjson && args.json) {
        res.json(obj);
        return res.sent = true;
      } else {
        res.render(view, obj);
        return res.sent = true;
      }
    }
  };

  //将对象转换为json格式的数据，切添加status = success sent = true，返回正确的json数据
  exports.ressendsuccess = function(req, res, obj) {
    var result;
    result = {
      status: 'success'
    };
    if (obj) {
      result = DeepAssign(obj, {
        status: 'success'
      });
      result = util.remove_empty(clone(result));
    }
    if (!res.finished && !res.sent) {
      res.json(result);
      return res.sent = true;
    }
  };

  exports.getadminreqparameter = function(req, res, obj, pn, name, require, defaultvalue = null) {
    var params;
    params = exports.convertgetreqparam(obj, pn, name, require, defaultvalue);
    if (req.isadmin) {
      return exports.getreqparameter(req, res, params.obj, params.pn, params.name, params.require, params.defaultvalue);
    } else {
      return false;
    }
  };

  //返回整形参数
  exports.getreqintparameter = function(req, res, obj, pn, name, require, defaultvalue = null) {
    var params, result;
    params = exports.convertgetreqparam(obj, pn, name, require, defaultvalue);
    result = exports.getreqparameter(req, res, params.obj, params.pn, params.name, params.require, params.defaultvalue);
    if (result) {
      if (validator.isInt(params.obj[params.pn])) {
        params.obj[params.pn] = util.str2int(params.obj[params.pn]);
      } else if (validator.isInt(params.defaultvalue)) {
        params.obj[params.pn] = params.defaultvalue;
      } else if (params.require) {
        result = false;
      }
    }
    return result;
  };

  exports.getreqfloatparameter = function(req, res, obj, pn, name, require, defaultvalue = null) {
    var params, result;
    params = exports.convertgetreqparam(obj, pn, name, require, defaultvalue);
    result = exports.getreqparameter(req, res, params.obj, params.pn, params.name, params.require, params.defaultvalue);
    if (result) {
      if (validator.isFloat(params.obj[params.pn])) {
        params.obj[params.pn] = util.str2float(params.obj[params.pn]);
      } else if (validator.isFloat(params.defaultvalue)) {
        params.obj[params.pn] = params.defaultvalue;
      } else if (params.require) {
        result = false;
      }
    }
    return result;
  };

  exports.getreqboolparameter = function(req, res, obj, pn, name, require, defaultvalue = null) {
    var params, result;
    params = exports.convertgetreqparam(obj, pn, name, require, defaultvalue);
    result = exports.getreqparameter(req, res, params.obj, params.pn, params.name, params.require, params.defaultvalue);
    if (result) {
      if (validator.isBoolean(params.obj[params.pn])) {
        params.obj[params.pn] = util.str2bool(params.obj[params.pn]);
      } else if (validator.isBoolean(params.defaultvalue)) {
        params.obj[params.pn] = params.defaultvalue;
      } else if (params.require) {
        result = false;
      }
    }
    return result;
  };

  //检测req参数中是否有pn,有则把pn的值赋值给params.obj[pn]
  exports.getreqparameter = function(req, res, obj, pn, name, require, defaultvalue = null) {
    var params;
    //  req=staticobj.req
    params = exports.convertgetreqparam(obj, pn, name, require, defaultvalue);
    if (req.param(params.name) != null) {
      //    dl(req.param(name))
      params.obj[params.pn] = req.param(params.name);
      //当传值为空字符串时，将其值转变为null
      //如果默认值为空字符串，则不转变
      if (params.obj[params.pn] === '' && params.defaultvalue !== '') {
        params.obj[params.pn] = null;
      }
      return true;
    } else {
      if (params.require) {
        //      res=staticobj.res
        de(`缺少必需的数据-${params.name}`);
        if (typeof params.require === 'number') {
          exports.ressenderror(req, res, params.require);
        } else {
          exports.ressenderror(req, res, `缺少必需的数据-${params.name}`);
        }
        return false;
      } else {
        if ((params.defaultvalue != null) && (params.obj[params.pn] == null)) {
          params.obj[params.pn] = params.defaultvalue;
        }
        return true;
      }
    }
  };

  //name是可选参数,如果为空将name设置为pn
  exports.convertgetreqparam = function(obj, pn, name, require, defaultvalue) {
    var result;
    //  req=staticobj.req
    result = {
      obj: obj,
      pn: pn,
      name: name,
      require: require,
      defaultvalue: defaultvalue
    };
    if (typeof name === 'boolean' || typeof name === 'number') {
      result.defaultvalue = require;
      result.require = name;
      result.name = null;
    }
    if (typeof result.name === 'undefined' || result.name === null) {
      result.name = pn;
    }
    return result;
  };

  //如果用户不为空，使用newname代替name
  exports.changereqparametername = function(req, name, newname, defaultvalue = null) {
    var parambody;
    parambody = exports.getreqparameterobj(req, name);
    return util.changeobjkey(parambody, name, newname);
  };

  //获取访问的用户？
  exports.getreqparameterobj = function(req, name, defaultvalue = null) {
    if (req.body[name]) {
      return req.body;
    } else if (req.query[name]) {
      return req.query;
    } else if (req.params[name]) {
      return req.params;
    } else if (defaultvalue) {
      req.body[name] = defaultvalue;
      return req.body;
    }
  };

  //orm 的findlist通过req的参数获取model的list，自己包装
  exports.setormquery = function(req, value) {
    if (req.ormquery == null) {
      req.ormquery = {};
    }
    return util.merge_options(req.ormquery, value);
  };

  exports.findlistfromreq = function(req, res, model) {
    var args, commonparams, includeArr, key, ormcondition, tempcondiftion;
    args = {};
    tempcondiftion = {};
    args.where = tempcondiftion;
    commonparams = ['limit', 'skip', 'orderby', 'desc', 'columnonly', 'wherestring'];
    exports.getreqparameter(req, res, args, 'limit', null, false);
    exports.getreqparameter(req, res, args, 'skip', null, false, 0);
    exports.getreqparameter(req, res, args, 'orderby', null, false, 'createdAt');
    exports.getreqparameter(req, res, args, 'desc', null, false, 0);
    exports.getreqparameter(req, res, args, 'include', null, false); //传入有对应关系的数据库名
    //  exports.getreqparameter(req, res, args, 'columnonly', false)
    if (req.ormquery != null) {
      if (req.ormquery.columnonly != null) {
        args.columnonly = req.ormquery.columnonly;
      }
      if (req.ormquery.wherestring != null) {
        args.wherestring = req.ormquery.wherestring;
      }
    }
    for (key in req.params) {
      if (indexOf.call(commonparams, key) < 0) {
        exports.getreqparameter(req, res, tempcondiftion, key, false);
      }
    }
    for (key in req.query) {
      if (indexOf.call(commonparams, key) < 0) {
        exports.getreqparameter(req, res, tempcondiftion, key, false);
      }
    }
    for (key in req.body) {
      if (indexOf.call(commonparams, key) < 0) {
        exports.getreqparameter(req, res, tempcondiftion, key, false);
      }
    }
    ormcondition = {};
    ormcondition = exports.buildormcondition(model, args);
    dl('ormcondition');
    dl(ormcondition);
    if (ormcondition.wherestring != null) {
      ormcondition.where = [ormcondition.wherestring.querystr, ormcondition.wherestring.queryvalue];
    }
    if (ormcondition.include != null) {
      includeArr = ormcondition.include.split(',');
      ormcondition.include = [];
      includeArr.forEach(function(item) {
        return ormcondition.include.push({
          model: models[item],
          required: false
        });
      });
    }
    if (ormcondition.only.length > 0) {
      ormcondition.attributes = ormcondition.only;
    }
    return ormcondition;
  };

  //返回orm的condition
  exports.buildormcondition = function(models, obj) {
    var c, desc, i, k, key, key2, l, len, modelproperties, p, ref, ref1, ref2, result, where;
    modelproperties = [];
    modelproperties = (function() {
      var results1;
      results1 = [];
      for (p in models.attributes) {
        results1.push(models.attributes[p].fieldName);
      }
      return results1;
    })();
    result = {
      order: [],
      where: {},
      only: []
    };
    if (obj.where != null) {
      for (key in obj.where) {
        where = this.str2ormparam(key, obj.where[key]);
        for (key2 in where) {
          if (indexOf.call(modelproperties, key2) < 0) {
            delete where[key2];
          }
          result.where = util.merge_options(result.where, where);
        }
      }
    }
    obj.where = result.where;
    dl(result);
    result = util.merge_options(result, obj);
    if ((result.orderby != null) && typeof result.orderby === "string") {
      result.orderby = result.orderby.split(',');
    } else {
      result.orderby = [result.orderby];
    }
    if ((result.desc != null) && typeof result.desc === "string") {
      result.desc = result.desc.split(',');
    } else {
      result.desc = [result.desc];
    }
    if (util.isArray(result.orderby)) {
      for (i = k = 0, ref = result.orderby.length - 1; 0 <= ref ? k <= ref : k >= ref; i = 0 <= ref ? ++k : --k) {
        desc = result.desc[i];
        if ((desc != null) && typeof desc !== 'undefined' && util.str2bool(desc)) {
          desc = 'DESC';
        } else {
          desc = 'ASC';
        }
        if (ref1 = result.orderby[i], indexOf.call(modelproperties, ref1) >= 0) {
          result.order.push([result.orderby[i], desc]);
        }
      }
    }
    if (util.isArray(result.columnonly)) {
      ref2 = result.columnonly;
      for (l = 0, len = ref2.length; l < len; l++) {
        c = ref2[l];
        if (indexOf.call(modelproperties, c) >= 0) {
          result.only.push(c);
        }
      }
    }
    return result;
  };

  //通过参数后缀获取查询条件,以以下字符结尾表示的意思为
  //[column]_from： column>=
  //[column]_to： column<=
  //[column]_array： column in ()
  //[column]_like： column like '%value%'
  //[column]_between： column between ('%value1%','%value2%') 以逗号分隔的2个值
  exports.str2ormparam = function(str, value) {
    var k, len, name, nv, op, operations, result;
    // gt: 6,                #> 6
    // gte: 6,               #>= 6
    // lt: 10,               #< 10
    // lte: 10,              #<= 10
    // ne: 20,               #!= 20
    // not: true,            #IS NOT TRUE
    // between: [6, 10],     #BETWEEN 6 AND 10
    // notBetween: [11, 15], #NOT BETWEEN 11 AND 15
    // in: [1, 2],           #IN [1, 2]
    // notIn: [1, 2],        #NOT IN [1, 2]
    // like: '%hat',         #LIKE '%hat'
    // notLike: '%hat'       #NOT LIKE '%hat'
    operations = [
      {
        opertaion: 'gt',
        arrayvalue: 0,
        arraymin: 0
      },
      {
        opertaion: 'gte',
        arrayvalue: 0,
        arraymin: 0
      },
      {
        opertaion: 'lt',
        arrayvalue: 0,
        arraymin: 0
      },
      {
        opertaion: 'lte',
        arrayvalue: 0,
        arraymin: 0
      },
      {
        opertaion: 'ne',
        arrayvalue: 0,
        arraymin: 0
      },
      {
        opertaion: 'not',
        arrayvalue: 0,
        arraymin: 0
      },
      {
        opertaion: 'between',
        arrayvalue: 1,
        arraymin: 2
      },
      {
        opertaion: 'notBetween',
        arrayvalue: 1,
        arraymin: 2
      },
      {
        opertaion: 'in',
        arrayvalue: 1,
        arraymin: 1
      },
      {
        opertaion: 'notIn',
        arrayvalue: 1,
        arraymin: 1
      },
      {
        opertaion: 'like',
        arrayvalue: 0,
        arraymin: 0,
        prefix: '%',
        suffix: '%'
      },
      {
        opertaion: 'notLike',
        arrayvalue: 0,
        arraymin: 0,
        prefix: '%',
        suffix: '%'
      }
    ];
    result = {};
    name = str;
    if ((value != null)) {
      for (k = 0, len = operations.length; k < len; k++) {
        op = operations[k];
        if (util.endWith(str, `_${op.opertaion}`)) {
          name = str.substring(0, str.lastIndexOf(`_${op.opertaion}`));
          if (op.arrayvalue) {
            if (typeof value === 'string') {
              value = value.split(',');
            }
            if (value.length < op.arraymin) {
              value = null;
            }
          } else {
            value = `${op.prefix || ''}${value}${op.suffix || ''}`;
          }
          if (value != null) {
            nv = {};
            nv[`$${op.opertaion}`] = value;
            value = nv;
          }
          break;
        }
      }
      if (value != null) {
        result[name] = value;
      }
    }
    return result;
  };

  //初始化amount信息
  exports.createdefaultfinance = function() {
    return {
      totalamount: 0,
      availableamount: 0,
      currentavailableamount: 0,
      amount: 0,
      freezeamount: 0,
      withdrawamount: 0
    };
  };

  //导出excel文件
  exports.exportexcel = function(req, res, cols, rows, filename = 'Report') {
    var conf, result;
    conf = {};
    conf.cols = cols;
    conf.rows = rows;
    result = nodeExcel.execute(conf);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats');
    res.setHeader("Content-Disposition", `attachment; filename=${filename}.xlsx`);
    return res.end(result, 'binary');
  };

  exports.pushappmsgtemplate = function(status, arg = []) {
    var m;
    if (!isNaN(status)) {
      status = parseInt(status);
    }
    switch (status) {
      case 1:
        m = moment(arg[1]);
        m.local();
        return `【活动即将开始】您报名的活动《${arg[0]}》将于${m.format('MM月DD日hh时mm分')}开始，敬请留意。`;
    }
  };

  exports.initialsyscode = function() {
    var argument, codestatus, i, j, results1;
    codestatus = appcfg.status;
    results1 = [];
    for (i in codestatus) {
      j = codestatus[i];
      results1.push((function() {
        var results2;
        results2 = [];
        for (j in codestatus[i]) {
          argument = {
            companyId: 'dd5ce810-73e4-11e6-a84b-7f25edbf2fdc',
            type: j,
            code: codestatus[i][j].code,
            name: codestatus[i][j].name,
            sysArgumentId: i
          };
          results2.push(models.argDetail.findOrCreate({
            where: {
              sysArgumentId: i,
              type: j
            },
            defaults: argument
          }).then(function(args, created) {
            var arg;
            arg = args[0];
            codestatus[arg.dataValues.sysArgumentId][arg.dataValues.type].code = arg.dataValues.code;
            return codestatus[arg.dataValues.sysArgumentId][arg.dataValues.type].name = arg.dataValues.name;
          }));
        }
        return results2;
      })());
    }
    return results1;
  };

  exports.updateUsr = function(req, res, obj, cb) {
    obj.updateUsr = req.user.id;
    return obj.save().then(function(newobj) {
      return cb(null, newobj);
    }).catch(function(err) {
      console.log(err);
      dl(err);
      return cb(53);
    });
  };

  exports.updateRlsUsr = function(req, res, obj, cb) {
    obj.rlsUsr = req.user.id;
    obj.rlsDt = Date();
    return obj.save().then(function(newobj) {
      return cb(null, newobj);
    }).catch(function() {
      return cb(54);
    });
  };

  exports.createUsr = function(req, res, target, args, cb) {
    args.createUsr = req.user.id;
    args.updateUsr = req.user.id;
    return target.create(args).then(function(newobj) {
      console.log(newobj);
      return cb(null, newobj);
    }).catch(function(err) {
      console.log(err);
      return cb(55);
    });
  };

  //事务的批量查询，传入model的数组及对应的名称数组（查询的是所有数据）
  //modelArr  需要查询的表
  //attArr  需要查询的字段
  exports.queryModelArr = function(modelArr, data, t, attArr, whereArr) {
    var i, j, query;
    //当不传入attArr时，搜索所有表的全部字段
    //当attArr中，有null元素时，代表搜索该对应表的全部字段
    if (attArr == null) {
      attArr = [];
      for (j in modelArr) {
        attArr.push({
          exclude: []
        });
      }
    } else {
      attArr.forEach(function(item) {
        if (item == null) {
          return item = {
            exclude: []
          };
        }
      });
    }
    //当不传入whereArr时，不添加限制条件
    //当whereArr中，有null元素时，不添加限制条件
    if (whereArr == null) {
      whereArr = [];
      for (j in modelArr) {
        whereArr.push({});
      }
    } else {
      whereArr.forEach(function(item) {
        if (item == null) {
          return item = {};
        }
      });
    }
    i = 0;
    query = function(i, t) {
      var modelname, orderArr;
      modelname = modelArr[i].getTableName();
      orderArr = modelname === 'salaryType' ? [['orderNo', 'ASC']] : [];
      return modelArr[i].findAll({
        where: whereArr[i],
        attributes: attArr[i],
        transaction: t,
        order: orderArr
      }).then(function(objs) {
        var temparr;
        temparr = [];
        objs.forEach(function(item) {
          return temparr.push(item.dataValues);
        });
        if (modelname === 'company') {
          modelname += 'Name';
        } else {
          modelname += 'Id';
        }
        data[modelname] = temparr;
        if (i < modelArr.length - 1) {
          return query(++i, t);
        }
      });
    };
    return query(i, t);
  };

  //检验是否能够对目标进行release、confirm等更新操作操作
  //errArr传入release、confirm报错时返回的错误代码数组
  exports.verifyUpdate = function(modelstatus, updatestatus, errArr, cb) {
    if (updatestatus === config.rlsstatus.release && modelstatus !== config.rlsstatus.origin) {
      return cb(errArr[0]);
    } else if (updatestatus === config.rlsstatus.confirm && modelstatus !== config.rlsstatus.release) {
      return cb(errArr[1]);
    } else if (updatestatus === config.rlsstatus.abandon && (modelstatus !== config.rlsstatus.origin && modelstatus !== config.rlsstatus.release)) {
      return cb(errArr[2]);
    } else {
      return cb();
    }
  };

  //检测该ID是否重复
  exports.checkRepeatId = async function(model, primaryKey, id) {
    var obj;
    obj = (await model.findOne({
      where: {
        [`${primaryKey}`]: id,
        status: 1
      }
    }));
    if (obj != null) {
      throw new Error(`1,${primaryKey}`);
    }
  };

  //检验是否拥有权限
  exports.checkPermission = function(req, permission) {
    var item, k, len, own, ref;
    own = false;
    ref = req.user.dataValues.scopes;
    for (k = 0, len = ref.length; k < len; k++) {
      item = ref[k];
      if (permission === item) {
        own = true;
        console.log('via permission:', permission);
        break;
      }
    }
    return own;
  };

  exports.conditionsearch = function(req, res) {
    var AND, andtrim, args, blank, c, conditions, enddt, eq, i, inner_validstr, innercondition, innermodel, innerquerystr, innerreg, outer_validstr, outercondition, outermodel, outerquerystr, outerreg, querystr, quotationed, startdt, validquery;
    blank = " ";
    eq = " = ";
    AND = " AND";
    outer_validstr = '';
    inner_validstr = '';
    andtrim = function(str) {
      return str.replace(/\s+AND$/, '').trim();
    };
    quotationed = function(str) {
      return '\'' + str + '\'';
    };
    // --- above 准备工作----
    args = {};
    if (common.getreqparameter(req, res, args, 'conditions', null, true, null)) {
      console.log(args);
      conditions = JSON.parse(args.conditions);
      innerreg = /^inner/g;
      outerreg = /^outer/g;
      for (i in conditions) {
        if (innerreg.test(i)) {
          innercondition = conditions[i];
          innermodel = i.replace(innerreg, '').trim();
        } else if (outerreg.test(i)) {
          outercondition = conditions[i];
          outermodel = i.replace(outerreg, '').trim();
        } else {
          throw new Error('条件格式不符合规则');
        }
      }
      if (innermodel === 'staff' || innermodel === 'inviteodr') {
        outerquerystr = `SELECT code FROM ${outermodel} WHERE`;
      } else {
        outerquerystr = `SELECT id FROM ${outermodel} WHERE`;
      }
      innerquerystr = `SELECT * FROM ${innermodel} WHERE`;
      for (c in outercondition) {
        if (outercondition[c].length = 0) {
          continue;
        } else {
          outerquerystr += blank + c + eq + quotationed(outercondition[c]) + AND;
        }
        outer_validstr += outercondition[c];
      }
      outerquerystr = andtrim(outerquerystr);
      for (c in innercondition) {
        if (util.isArray(innercondition[c])) {
          startdt = innercondition[c][0];
          enddt = innercondition[c][1];
          if (startdt.length > 0) {
            innerquerystr += blank + c + " > " + quotationed(moment(startdt).format("YYYY-MM-DD HH:mm:ss")) + AND;
          }
          if (enddt.length > 0) {
            innerquerystr += blank + c + " < " + quotationed(moment(enddt).format("YYYY-MM-DD HH:mm:ss")) + AND;
          }
        } else {
          if (innercondition[c].length === 0) {
            continue;
          } else {
            innerquerystr += blank + c + eq + quotationed(innercondition[c]) + AND;
          }
        }
      }
      if (innermodel === 'staff' || innermodel === 'inviteodr') {
        outermodel += 'code';
      } else {
        outermodel += 'Id';
      }
      if (outer_validstr.length > 0) {
        querystr = innerquerystr + blank + outermodel + blank + 'IN (' + outerquerystr + ')';
      } else {
        querystr = andtrim(innerquerystr);
      }
      console.log(querystr);
      validquery = querystr.split('WHERE');
      if (validquery[validquery.length - 1].length === 0) {
        querystr = validquery[0].trim();
      }
      return sequelize.query(querystr).then(function(results) {
        return exports.ressendsuccess(req, res, {
          results: results[0]
        });
      }).catch(exports.catchsendcode(req, res, 601));
    }
  };

  exports.mergeobj = function(obj, second = '', third = '', ...others) {
    var attr, k, l, len, len1, secondobj, thirdobj;
    if (!typeof obj === 'object') {
      throw new Error('对象必须被传入!');
    }
    if (obj[second] != null) {
      secondobj = obj[second].dataValues;
      if (secondobj[third] != null) {
        thirdobj = obj[second][third].dataValues;
        console.log(others);
        for (k = 0, len = others.length; k < len; k++) {
          attr = others[k];
          if (secondobj.hasOwnProperty(attr)) {
            obj[attr] = secondobj[attr];
            console.log(attr, obj[attr]);
          }
          if (thirdobj.hasOwnProperty(attr)) {
            obj[attr] = thirdobj[attr];
            console.log(attr, obj[attr]);
          }
        }
      } else {
        for (l = 0, len1 = others.length; l < len1; l++) {
          attr = others[l];
          if (secondobj.hasOwnProperty(attr)) {
            obj[attr] = secondobj[attr];
          }
        }
      }
      delete obj[second];
    }
    return obj;
  };

  //返回错误信息
  exports.catchsendmessage = function(req, res) {
    return function(err) {
      var errArr;
      console.log('Error:', err);
      dl('Error:', err);
      //错误以下集中
      //1：sequelize报的错，这个类型的错误存在sql属性，根据sql属性区别；在sequelize的错误中，有的存在errors，有的不存在
      //2：代码中抛出的错误，没有sql属性
      //3：从状态机中抛出的错误，有transition属性
      if ((err.sql != null) && err.errors) {
        if ((err.errors[0] != null) && err.errors[0].message === 'PRIMARY must be unique') {
          errArr = [1, err.errors[0].value];
        } else {
          errArr = err.errors == null ? [err.message] : [err.errors[0].message];
        }
      } else if (err.transition != null) {
        errArr = [305, `当前状态--${err.from}，操作--${err.transition}`];
      } else {
        errArr = err.message.split(',');
      }
      return exports.ressenderror(req, res, errArr[0], errArr[1]);
    };
  };

  exports.isExist = function(arg) {
    if (arg != null) {
      return true;
    }
    return false;
  };

}).call(this);
