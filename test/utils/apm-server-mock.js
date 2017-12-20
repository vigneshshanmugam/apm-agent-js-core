var Subscription = require('../../src/common/subscription')
class ApmServerMock {
  constructor (apmServer) {
    var subscription = this.subscription = new Subscription()
    var _apmServer = this._apmServer = apmServer
    var calls = this.calls = {}

    function applyMock (methodName) {
      var args = Array.prototype.slice.call(arguments)
      args.splice(0, 1)
      var result
      var mocked = false
      if (_apmServer) {
        result = _apmServer[methodName].apply(_apmServer, args)
      }else {
        result = Promise.resolve()
        mocked = true
      }
      var call = {args: args, mocked: mocked}
      if (calls[methodName]) {
        calls[methodName].push(call)
      }else {
        calls[methodName] = [call]
      }
      subscription.applyAll(this, [call])
      return result
    }

    this.sendErrors = applyMock.bind(_apmServer, 'sendErrors')
    this.sendTransactions = applyMock.bind(_apmServer, 'sendTransactions')
  }
}

module.exports = ApmServerMock
