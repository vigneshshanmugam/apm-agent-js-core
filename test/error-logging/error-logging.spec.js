var ErrorLogging = require('../../src/error-logging/error-logging.js')
var ApmServer = require('../../src/common/apm-server.js')
var createServiceFactory = require('..').createServiceFactory
var apmTestConfig = require('../apm-test-config')()

describe('ErrorLogging', function () {
  var testErrorMessage = 'errorevent_test_error_message'
  var configService
  var logger
  var apmServer
  var errorLogging
  beforeEach(function () {
    var serviceFactory = createServiceFactory()
    configService = serviceFactory.getService('ConfigService')
    configService.setConfig(apmTestConfig)
    apmServer = serviceFactory.getService('ApmServer')
    errorLogging = serviceFactory.getService('ErrorLogging')
  })

  it('should send error', function (done) {
    try {
      throw new Error('test error')
    } catch(error) {
      var errorObject = errorLogging.createErrorDataModel({error: error})
    }
    apmServer.sendErrors([errorObject])
      .then(function () {
        done()
      }, function (reason) {
        fail('Failed to send errors to the server, reason: ' + reason)
      })
  })

  it('should process errors', function (done) {
    spyOn(apmServer, 'sendErrors').and.callThrough()

    // in IE 10, Errors are given a stack once they're thrown.
    try {
      throw new Error('unittest error')
    } catch (error) {
      // error['_opbeat_extra_context'] = {test: 'hamid'}
      error.test = 'hamid'
      error.aDate = new Date('2017-01-12T00:00:00.000Z')
      var obj = {test: 'test'}
      obj.obj = obj
      error.anObject = obj
      error.aFunction = function noop () {}
      error.null = null
      errorLogging.logError(error)
        .then(function () {
          expect(apmServer.sendErrors).toHaveBeenCalled()
          var errors = apmServer.sendErrors.calls.argsFor(0)[0]
          expect(errors.length).toBe(1)
          var errorData = errors[0]
          expect(errorData.context.test).toBe('hamid')
          expect(errorData.context.aDate).toBe('2017-01-12T00:00:00.000Z') // toISOString()
          expect(errorData.context.anObject).toBeUndefined()
          expect(errorData.context.aFunction).toBeUndefined()
          expect(errorData.context.null).toBeUndefined()
          done()
        }, function (reason) {
          fail(reason)
        })
    }
  })
  function createErrorEvent (message) {
    var errorEvent
    var errorEventData = {
      type: 'error',
      message: 'Uncaught Error: ' + message,
      lineno: 1,
      filename: 'test.js'
    }

    try {
      throw new Error(message)
    } catch (e) {
      errorEventData.error = e
    }

    try {
      errorEvent = new ErrorEvent('error', errorEventData)
    } catch (e) {
      console.log("Doesn't support creating ErrorEvent, using pure object instead.")
      errorEvent = errorEventData
    }
    return errorEvent
  }

  it('should support ErrorEvent', function (done) {
    spyOn(apmServer, 'sendErrors').and.callThrough()

    var errorEvent = createErrorEvent(testErrorMessage)

    errorLogging.logErrorEvent(errorEvent)
      .then(function () {
        expect(apmServer.sendErrors).toHaveBeenCalled()
        var errors = apmServer.sendErrors.calls.argsFor(0)[0]
        expect(errors.length).toBe(1)
        var errorData = errors[0]
        // the message is different in IE 10 since error type is not available
        expect(errorData.exception.message).toContain(testErrorMessage)
        // the number of frames is different in different platforms
        expect(errorData.exception.stacktrace.length).toBeGreaterThan(0)
        done()
      }, function (reason) {
        fail('Failed to send errors to the server, reason: ' + reason)
      })
  })

  it('should install onerror and accept ErrorEvents', function (done) {
    var count = 0
    spyOn(apmServer, 'sendErrors').and.callFake(function (errors) {
      expect(errors.length).toBe(1)
      var error = errors[0]
      expect(error.exception.message).toContain(testErrorMessage)

      count++
      if (count === 6) {
        done()
      }
    })

    window.onerror = null
    errorLogging.registerGlobalEventListener()

    expect(typeof window.onerror).toBe('function')
    var apmOnError = window.onerror

    try {
      throw new Error(testErrorMessage)
    } catch(error) {
      apmOnError(testErrorMessage, 'filename', 1, 2, error)
    }

    apmOnError(testErrorMessage, 'filename', 1, 2, undefined)
    apmOnError(testErrorMessage, undefined, undefined, undefined, undefined)
    apmOnError('Test:' + testErrorMessage, 'filename', 1, 2, undefined)
    apmOnError('Script error.' + testErrorMessage, undefined, undefined, undefined, undefined)
    apmOnError(createErrorEvent(testErrorMessage))
  })

  it('should handle edge cases', function (done) {
    var resultPromises = []
    resultPromises.push(errorLogging.logErrorEvent())
    resultPromises.push(errorLogging.logErrorEvent({}))
    resultPromises.push(errorLogging.logErrorEvent(undefined))

    Promise.all(resultPromises).then(function (result) {
      done()
    })
  })
})
