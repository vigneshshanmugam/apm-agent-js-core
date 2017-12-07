var createServiceFactory = require('..').createServiceFactory
var Transaction = require('../../src/performance-monitoring/transaction')
var Span = require('../../src/performance-monitoring/span')
var apmTestConfig = require('../apm-test-config')()

describe('PerformanceMonitoring', function () {
  var serviceFactory
  var apmServer
  var performanceMonitoring
  var configService
  var logger

  beforeEach(function () {
    serviceFactory = createServiceFactory()
    configService = serviceFactory.getService('ConfigService')
    logger = serviceFactory.getService('LoggingService')
    configService.setConfig(apmTestConfig)

    apmServer = serviceFactory.getService('ApmServer')
    performanceMonitoring = serviceFactory.getService('PerformanceMonitoring')
  })
  it('should send performance monitoring data to apm-server', function () {

    // performanceMonitoring._transactionService
    var tr = new Transaction('tr-name', 'tr-type', configService.config, logger)
    var span1 = new Span('span 1', 'test-span')
    span1.end()
    tr.spans.push(span1)
    tr.end()
    var payload = performanceMonitoring.convertTransactionsToServerModel([tr])
    apmServer.sendTransactions(payload)
  })

  it('should group small continuously similar spans up until the last one', function () {
    var tr = new Transaction('transaction', 'transaction')
    var span1 = tr.startSpan('signature', 'type')
    span1.end()
    var span2 = tr.startSpan('signature', 'type')
    span2.end()
    var span3 = tr.startSpan('another-signature', 'type')
    span3.end()
    var span4 = tr.startSpan('signature', 'type')
    span4.end()
    var span5 = tr.startSpan('signature', 'type')
    span5.end()

    tr.end()

    tr._rootSpan._start = 10
    tr._rootSpan._end = 1000

    span1._start = 20
    span1._end = 30

    span2._start = 31
    span2._end = 35

    span3._start = 35
    span3._end = 45

    span4._start = 50
    span4._end = 60

    span5._start = 61
    span5._end = 70

    tr.spans.sort(function (spanA, spanB) {
      return spanA._start - spanB._start
    })
    var grouped = performanceMonitoring.groupSmallContinuouslySimilarSpans(tr, 0.05)

    expect(grouped.length).toBe(4)
    expect(grouped[0].signature).toBe('transaction')
    expect(grouped[1].signature).toBe('2x signature')
    expect(grouped[2].signature).toBe('another-signature')
    expect(grouped[3].signature).toBe('2x signature')
  })

  it('should group small continuously similar spans', function () {
    var tr = new Transaction('transaction', 'transaction', { 'performance.enableStackFrames': true })
    var span1 = tr.startSpan('signature', 'type')
    span1.end()
    var span2 = tr.startSpan('signature', 'type')
    span2.end()
    var span3 = tr.startSpan('signature', 'type')
    span3.end()
    var span4 = tr.startSpan('signature', 'type')
    span4.end()
    var span5 = tr.startSpan('another-signature', 'type')
    span5.end()

    tr.end()

    tr._rootSpan._start = 10
    tr._rootSpan._end = 1000

    span1._start = 20
    span1._end = 30

    span2._start = 31
    span2._end = 35

    span3._start = 35
    span3._end = 45

    span4._start = 50
    span4._end = 60

    span5._start = 60
    span5._end = 70

    tr.spans.sort(function (spanA, spanB) {
      return spanA._start - spanB._start
    })

    var grouped = performanceMonitoring.groupSmallContinuouslySimilarSpans(tr, 0.05)

    expect(grouped.length).toBe(3)
    expect(grouped[0].signature).toBe('transaction')
    expect(grouped[1].signature).toBe('4x signature')
    expect(grouped[2].signature).toBe('another-signature')
  })

  it('should calculate browser responsiveness', function () {
    var tr = new Transaction('transaction', 'transaction', { 'performance.enableStackFrames': true })
    tr.end()

    tr._rootSpan._start = 1

    tr._rootSpan._end = 400
    tr.browserResponsivenessCounter = 0
    var resp = performanceMonitoring.checkBrowserResponsiveness(tr, 500, 2)
    expect(resp).toBe(true)

    tr._rootSpan._end = 1001
    tr.browserResponsivenessCounter = 2
    resp = performanceMonitoring.checkBrowserResponsiveness(tr, 500, 2)
    expect(resp).toBe(true)

    tr._rootSpan._end = 1601
    tr.browserResponsivenessCounter = 2
    resp = performanceMonitoring.checkBrowserResponsiveness(tr, 500, 2)
    expect(resp).toBe(true)

    tr._rootSpan._end = 3001
    tr.browserResponsivenessCounter = 3
    resp = performanceMonitoring.checkBrowserResponsiveness(tr, 500, 2)
    expect(resp).toBe(false)
  })

  it('should scheduleTransactionSend', function () {
    expect(performanceMonitoring._sendIntervalId).toBeUndefined()
    performanceMonitoring.scheduleTransactionSend()
    expect(performanceMonitoring._sendIntervalId).toBeDefined()
    clearInterval(performanceMonitoring._sendIntervalId)
  })

  it('should sendTransactionInterval', function () {
    var result = performanceMonitoring.sendTransactionInterval()
    expect(result).toBeUndefined()
    var transactionService = serviceFactory.getService('TransactionService')
    var tr = new Transaction('test transaction', 'transaction', {}, logger)
    var span = tr.startSpan('test span', 'test span thype')
    span.end()
    tr.detectFinish()
    transactionService._queue.push(tr)
    result = performanceMonitoring.sendTransactionInterval()
    expect(result).toBeDefined()
  })
})
