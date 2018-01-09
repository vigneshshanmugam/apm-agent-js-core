var ApmServer = require('../../src/common/apm-server')
var createServiceFactory = require('..').createServiceFactory

describe('ApmServer', function () {
  var serviceFactory
  var apmServer
  var configService
  var loggingService
  beforeEach(function () {
    serviceFactory = createServiceFactory()
    configService = serviceFactory.getService('ConfigService')
    loggingService = serviceFactory.getService('LoggingService')
    apmServer = serviceFactory.getService('ApmServer')
  })

  it('should not send transctions when the list is empty', function () {
    spyOn(apmServer, '_postJson')
    var result = apmServer.sendTransactions([])
    expect(result).toBeUndefined()
    expect(apmServer._postJson).not.toHaveBeenCalled()
  })

  it('should report http errors', function (done) {
    var apmServer = new ApmServer(configService, loggingService)
    configService.setConfig({
      serverUrl: 'http://localhost:54321',
      serviceName: 'test-service'
    })
    var result = apmServer.sendTransactions([{test: 'test'}])
    expect(result).toBeDefined()
    result.then(function () {
      fail('Request should have failed!')
    }, function (reason) {
      expect(reason).toBeDefined()
      done()
    })
  })

  it('should check config validity before making request to the server', function () {
    spyOn(apmServer, '_postJson')
    spyOn(loggingService, 'warn')
    spyOn(loggingService, 'debug')
    expect(configService.isValid()).toBe(false)

    var result = apmServer.sendTransactions([{test: 'test'}])
    expect(result).toBeUndefined()
    expect(apmServer._postJson).not.toHaveBeenCalled()
    expect(loggingService.warn).toHaveBeenCalled()
    expect(loggingService.debug).not.toHaveBeenCalled()

    loggingService.warn.calls.reset()
    var result = apmServer.sendErrors([{test: 'test'}])
    expect(result).toBeUndefined()
    expect(apmServer._postJson).not.toHaveBeenCalled()
    expect(loggingService.warn).not.toHaveBeenCalled()
    expect(loggingService.debug).toHaveBeenCalled()

    configService.setConfig({serviceName: 'serviceName'})
    spyOn(loggingService, 'warn')
    expect(configService.isValid()).toBe(true)
    apmServer.sendTransactions([{test: 'test'}])
    expect(apmServer._postJson).toHaveBeenCalled()
    expect(loggingService.warn).not.toHaveBeenCalled()
  })
})
