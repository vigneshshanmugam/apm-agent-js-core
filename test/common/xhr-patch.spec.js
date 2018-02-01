var xhrPatch = require('../../src/common/patching/xhr-patch')

var patchUtils = require('../../src/common/patching/patch-utils')
var urlSympbol = patchUtils.apmSymbol('url')
var methodSymbol = patchUtils.apmSymbol('method')


describe('xhrPatch', function () {
  xhrPatch()

  it('should have correct url and method', function () {
    var req = new window.XMLHttpRequest()
    req.open('GET', '/', true)
    expect(req[urlSympbol]).toBe('/')
    expect(req[methodSymbol]).toBe('GET')
  })
})
