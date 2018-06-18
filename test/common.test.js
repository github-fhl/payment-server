const
  should = require('should')
  , clone = require('clone')
  , session = require('supertest-session')
  , getType = require('../component/protypemethon').getType
  , rejectArr = require('../component/appcfg').rejectArr
  , testCfg = require('./config.test')
  , testFn = require('./fn.test')
  , order = clone(testCfg.order)
  , roles = testCfg.roles
  , port = testCfg.port
  , agent = testCfg.agent
  , login = testFn.login
  , stateMachine = require('./stateMachine.test')
  , destroyOrder = stateMachine.destroyOrder
  , approveFlow = stateMachine.approveFlow
  ;

