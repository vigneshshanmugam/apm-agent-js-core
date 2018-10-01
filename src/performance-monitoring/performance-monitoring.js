var utils = require('../common/utils')
var patchingSub = require('../common/patching').subscription

class PerformanceMonitoring {
  constructor (apmServer, configService, loggingService, zoneService, transactionService) {
    this._apmServer = apmServer
    this._configService = configService
    this._logginService = loggingService
    this._zoneService = zoneService
    this._transactionService = transactionService
  }

  init () {
    if (this._zoneService) {
      this._zoneService.initialize(window.Zone.current)
    }
    var performanceMonitoring = this
    this._transactionService.subscribe(function (tr) {
      var payload = performanceMonitoring.createTransactionPayload(tr)
      if (payload) {
        performanceMonitoring._apmServer.addTransaction(payload)
      }
    })

    this.subscribeToXhrPatch()
  }

  subscribeToXhrPatch () {
    var configService = this._configService
    var transactionService = this._transactionService
    this.cancelPatchSub = patchingSub.subscribe(function (event, task) {
      if (event === 'schedule' && task.source === 'XMLHttpRequest.send' && task.data) {
        var spanName = task.data.method + ' ' + task.data.url
        var span = transactionService.startSpan(spanName, 'ext.HttpRequest')
        if (span) {
          var isDtEnabled = configService.get('distributedTracing')
          if (isDtEnabled && utils.isSameOrigin(task.data.url, window.location.href)) {
            var headerName = configService.get('distributedTracingHeaderName')
            var headerValueCallback = configService.get('distributedTracingHeaderValueCallback')
            if (typeof headerValueCallback !== 'function') {
              headerValueCallback = utils.getDtHeaderValue
            }
            var target = task.data.target
            var headerValue = headerValueCallback(span)
            if (target && headerName && headerValue) {
              target.setRequestHeader(headerName, headerValue)
            }
          }
          span.setContext({
            http: {
              method: task.data.method,
              url: task.data.url,
              sync: task.data.sync
            }
          })
          task.data.span = span
        }
      } else if (event === 'invoke' && task.data && task.data.span) {
        task.data.span.setContext({ http: { status_code: task.data.target.status } })
        task.data.span.end()
      }
    })
  }

  setTransactionContextInfo (transaction) {
    var context = this._configService.get('context')
    if (context) {
      transaction.addContextInfo(context)
    }
  }

  filterTransaction (tr) {
    var performanceMonitoring = this
    var transactionDurationThreshold = this._configService.get('transactionDurationThreshold')
    var duration = tr.duration()
    if (!duration || duration > transactionDurationThreshold || !tr.spans.length) {
      return false
    }

    var browserResponsivenessInterval = this._configService.get('browserResponsivenessInterval')
    var checkBrowserResponsiveness = this._configService.get('checkBrowserResponsiveness')

    if (checkBrowserResponsiveness && !tr.isHardNavigation) {
      var buffer = performanceMonitoring._configService.get('browserResponsivenessBuffer')

      var wasBrowserResponsive = performanceMonitoring.checkBrowserResponsiveness(
        tr,
        browserResponsivenessInterval,
        buffer
      )
      if (!wasBrowserResponsive) {
        performanceMonitoring._logginService.debug(
          'Transaction was discarded! browser was not responsive enough during the transaction.',
          ' duration:',
          duration,
          ' browserResponsivenessCounter:',
          tr.browserResponsivenessCounter,
          'interval:',
          browserResponsivenessInterval
        )
        return false
      }
    }
    return true
  }

  prepareTransaction (transaction) {
    var performanceMonitoring = this
    transaction.spans.sort(function (spanA, spanB) {
      return spanA._start - spanB._start
    })

    if (performanceMonitoring._configService.get('groupSimilarSpans')) {
      var similarSpanThreshold = performanceMonitoring._configService.get('similarSpanThreshold')
      transaction.spans = performanceMonitoring.groupSmallContinuouslySimilarSpans(
        transaction,
        similarSpanThreshold
      )
    }
    performanceMonitoring.setTransactionContextInfo(transaction)
  }

  createTransactionDataModel (transaction) {
    var configContext = this._configService.get('context')
    var stringLimit = this._configService.get('serverStringLimit')
    var transactionStart = transaction._rootSpan._start

    var spans = transaction.spans.map(function (span) {
      var context
      if (span.context) {
        context = utils.sanitizeObjectStrings(span.context, stringLimit)
      }
      return {
        id: span.id,
        transaction_id: transaction.id,
        parent_id: span.parentId || transaction.id,
        trace_id: transaction.traceId,
        name: utils.sanitizeString(span.signature, stringLimit, true),
        type: utils.sanitizeString(span.type, stringLimit, true),
        start: span._start - transactionStart,
        duration: span.duration(),
        context: context
      }
    })

    var context = utils.merge({}, configContext, transaction.contextInfo)
    return {
      id: transaction.id,
      trace_id: transaction.traceId,
      timestamp: transaction.timestamp,
      name: utils.sanitizeString(transaction.name, stringLimit, false),
      type: utils.sanitizeString(transaction.type, stringLimit, true),
      duration: transaction.duration(),
      spans: spans,
      context: context,
      marks: transaction.marks,
      span_count: {
        started: spans.length
      }
    }
  }

  createTransactionPayload (transaction) {
    this.prepareTransaction(transaction)
    var filtered = this.filterTransaction(transaction)
    if (filtered) {
      return this.createTransactionDataModel(transaction)
    }
  }

  sendTransactions (transactions) {
    var payload = transactions.map(this.createTransactionPayload.bind(this)).filter(function (tr) {
      return tr
    })
    this._logginService.debug('Sending Transactions to apm server.', transactions.length)

    // todo: check if transactions are already being sent
    var promise = this._apmServer.sendTransactions(payload)
    return promise
  }

  convertTransactionsToServerModel (transactions) {
    return transactions.map(this.createTransactionDataModel.bind(this))
  }

  groupSmallContinuouslySimilarSpans (transaction, threshold) {
    var transDuration = transaction.duration()
    var spans = []
    var lastCount = 1
    transaction.spans.forEach(function (span, index) {
      if (spans.length === 0) {
        spans.push(span)
      } else {
        var lastSpan = spans[spans.length - 1]

        var isContinuouslySimilar =
          lastSpan.type === span.type &&
          lastSpan.signature === span.signature &&
          span.duration() / transDuration < threshold &&
          (span._start - lastSpan._end) / transDuration < threshold

        var isLastSpan = transaction.spans.length === index + 1

        if (isContinuouslySimilar) {
          lastCount++
          lastSpan._end = span._end
        }

        if (lastCount > 1 && (!isContinuouslySimilar || isLastSpan)) {
          lastSpan.signature = lastCount + 'x ' + lastSpan.signature
          lastCount = 1
        }

        if (!isContinuouslySimilar) {
          spans.push(span)
        }
      }
    })
    return spans
  }

  checkBrowserResponsiveness (transaction, interval, buffer) {
    var counter = transaction.browserResponsivenessCounter
    if (typeof interval === 'undefined' || typeof counter === 'undefined') {
      return true
    }

    var duration = transaction.duration()
    var expectedCount = Math.floor(duration / interval)
    var wasBrowserResponsive = counter + buffer >= expectedCount

    return wasBrowserResponsive
  }
}

module.exports = PerformanceMonitoring
