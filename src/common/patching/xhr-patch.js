var patchUtils = require('./patch-utils')

var urlSympbol = patchUtils.apmSymbol('url')
var methodSymbol = patchUtils.apmSymbol('method')
var isAsyncSymbol = patchUtils.apmSymbol('isAsync')

module.exports = function patchXMLHttpRequest () {
  patchUtils.patchMethod(window.XMLHttpRequest.prototype, 'open', function (delegate) {
    return function (self, args) {
      self[methodSymbol] = args[0]
      self[urlSympbol] = args[1]
      self[isAsyncSymbol] = args[2]
      delegate.apply(self, args)
    }
  })
}
