
const
    testCfg = require('./config.test')
  , agent = testCfg.agent
;

/**
 * 返回一个登陆用的cb
 * @param role
 * @return {Function}
 */
function login(role) {
  return function(done) {
    agent
      .put('login')
      .send(role)
      .expect(function (res) {
        if(res.body.status == 'failed') console.log(res.body);
        res.body.status.should.be.equal('success');
      })
      .end(done);
  }
}
exports.login = login;


/**
 *  处理请求
 *    1、创建时，将创建成功后的 id 保存在对应的 obj 中
 *    2、更新时，将对应的 id 添加在 url 后面
 *    3、保存 sow 的 id
 *
 *  奇怪的参数处理方式：由于这是异步的，所以只能传入回调函数对引用类型参数进行处理
 *
 *
 * @param {String} action  操作方式：get/post/put/delete
 * @param {String} url   由于传入的是基本数值类型，无法通过回调函数的方式进行处理，所以将 url 赋给 args，从而通过处理 args.url 来处理 url
 * @param {Object} obj    发送的对象
 * @param handleObj    处理发送的对象
 * @param {String} status  请求返回的状态
 * @param  code   返回为 failed 时对应的错误码
 * @param  handle   对返回结果进行处理
 * @return {Function}
 */
let args = {};
exports.args = args;
function handleRequest(action, url, obj, handleObj, status, code, handle) {
  return function (done) {
    if (Object.getType(handleObj) !== 'function'){
      handle = code;
      code = status;
      status = handleObj;
      handleObj = null;
    }
    if (Object.getType(code) == 'function'){
      handle = code;
      code = null;
    }
    args.url = url;
    if (handleObj) handleObj();

    handle = handle || function (res) {
        if (res.body.status == 'failed') console.log(res.body);

        res.body.status.should.be.equal(status);
        if (status == 'failed'){
          res.body.code.should.be.equal(code);
        }
      };

    agent
      [action](args.url)
      .send(obj)
      .expect(handle)
      .end(done)
  }
}
exports.handleRequest = handleRequest;