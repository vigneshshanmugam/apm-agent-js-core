var ApmServer = require('../../src/common/apm-server')
var createServiceFactory = require('..').createServiceFactory

describe('ApmServer', function () {
  var serviceFactory
  var apmServer
  var configService
  beforeEach(function () {
    serviceFactory = createServiceFactory()
    apmServer = serviceFactory.getService('ApmServer')
    configService = serviceFactory.getService('ConfigService')
  })

  it('should not send transctions when the list is empty', function () {
    spyOn(apmServer, '_postJson')
    var result = apmServer.sendTransactions([])
    expect(result).toBeUndefined()
    expect(apmServer._postJson).not.toHaveBeenCalled()
  })

  it('should report http errors', function (done) {
    configService.setConfig({
      apiOrigin: 'http://localhost:54321'
    })
    var result = apmServer.sendTransactions([{test: 'test'}])
    expect(result).toBeDefined()
    result.then(undefined, function (reason) {
      expect(reason).toBeDefined()
      done()
    })
  })
})
