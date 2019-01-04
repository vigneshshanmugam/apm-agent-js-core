const {
  sanitizeObjectStrings,
  sanitizeString,
  checkSameOrigin,
  isDtHeaderValid,
  getDtHeaderValue,
  merge
} = require('../common/utils')
const patchingSub = require('../common/patching').subscription
const { globalState } = require('../common/patching/patch-utils')
const { SCHEDULE, INVOKE, XMLHTTPREQUEST_SOURCE, FETCH_SOURCE } = require('../common/constants')

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

    var patchSubFn = this.getXhrPatchSubFn(this._configService, this._transactionService)
    this.cancelPatchSub = patchingSub.subscribe(patchSubFn)
  }

  getXhrPatchSubFn () {
    var configService = this._configService
    var transactionService = this._transactionService
    return function (event, task) {
      if (
        (task.source === XMLHTTPREQUEST_SOURCE && !globalState.fetchInProgress) ||
        task.source === FETCH_SOURCE
      ) {
        if (event === SCHEDULE && task.data) {
          var spanName = task.data.method + ' ' + task.data.url
          var span = transactionService.startSpan(spanName, 'external.http')
          if (span) {
            var isDtEnabled = configService.get('distributedTracing')
            var origins = configService.get('distributedTracingOrigins')
            var isSameOrigin =
              checkSameOrigin(task.data.url, window.location.href) ||
              checkSameOrigin(task.data.url, origins)
            var target = task.data.target
            if (isDtEnabled && isSameOrigin && target) {
              var headerName = configService.get('distributedTracingHeaderName')
              var headerValueCallback = configService.get('distributedTracingHeaderValueCallback')
              if (typeof headerValueCallback !== 'function') {
                headerValueCallback = getDtHeaderValue
              }

              var headerValue = headerValueCallback(span)
              var isHeaderValid = isDtHeaderValid(headerValue)
              if (headerName && headerValue && isHeaderValid) {
                if (typeof target.setRequestHeader === 'function') {
                  target.setRequestHeader(headerName, headerValue)
                } else if (target.headers && typeof target.headers.append === 'function') {
                  target.headers.append(headerName, headerValue)
                }
              }
            }
            span.addContext({
              http: {
                method: task.data.method,
                url: task.data.url
              }
            })
            span.sync = task.data.sync
            task.data.span = span
          }
        } else if (event === INVOKE && task.data && task.data.span) {
          if (typeof task.data.target.status !== 'undefined') {
            task.data.span.addContext({ http: { status_code: task.data.target.status } })
          } else if (task.data.response) {
            task.data.span.addContext({ http: { status_code: task.data.response.status } })
          }
          task.data.span.end()
        }
      }
    }
  }

  setTransactionContext (transaction) {
    var context = this._configService.get('context')
    if (context) {
      transaction.addContext(context)
    }
  }

  filterTransaction (tr) {
    var performanceMonitoring = this
    var transactionDurationThreshold = this._configService.get('transactionDurationThreshold')
    var duration = tr.duration()
    if (!duration || duration > transactionDurationThreshold || !tr.spans.length || !tr.sampled) {
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

    transaction.spans = transaction.spans.filter(function (span) {
      return (
        span.duration() > 0 &&
        span._start >= transaction._start &&
        span._end > transaction._start &&
        span._start < transaction._end &&
        span._end <= transaction._end
      )
    })

    performanceMonitoring.setTransactionContext(transaction)
  }

  createTransactionDataModel (transaction) {
    var configContext = this._configService.get('context')
    var stringLimit = this._configService.get('serverStringLimit')
    var transactionStart = transaction._start

    var spans = transaction.spans.map(function (span) {
      var context
      if (span.context) {
        context = sanitizeObjectStrings(span.context, stringLimit)
      }
      return {
        id: span.id,
        transaction_id: transaction.id,
        parent_id: span.parentId || transaction.id,
        trace_id: transaction.traceId,
        name: sanitizeString(span.name, stringLimit, true),
        type: sanitizeString(span.type, stringLimit, true),
        subType: sanitizeString(span.subType, stringLimit, true),
        action: sanitizeString(span.action, stringLimit, true),
        sync: span.sync,
        start: span._start - transactionStart,
        duration: span.duration(),
        context: context
      }
    })

    var context = merge({}, configContext, transaction.context)
    return {
      id: transaction.id,
      trace_id: transaction.traceId,
      name: sanitizeString(transaction.name, stringLimit, false),
      type: sanitizeString(transaction.type, stringLimit, true),
      duration: transaction.duration(),
      spans: spans,
      context: context,
      marks: transaction.marks,
      span_count: {
        started: spans.length
      },
      sampled: transaction.sampled
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
          lastSpan.subType === span.subType &&
          lastSpan.action === span.action &&
          lastSpan.name === span.name &&
          span.duration() / transDuration < threshold &&
          (span._start - lastSpan._end) / transDuration < threshold

        var isLastSpan = transaction.spans.length === index + 1

        if (isContinuouslySimilar) {
          lastCount++
          lastSpan._end = span._end
        }

        if (lastCount > 1 && (!isContinuouslySimilar || isLastSpan)) {
          lastSpan.name = lastCount + 'x ' + lastSpan.name
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
