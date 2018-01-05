class PerformanceMonitoring {
  constructor (apmServer, configService, loggingService, zoneService, transactionService) {
    this._apmServer = apmServer
    this._configService = configService
    this._logginService = loggingService
    this._zoneService = zoneService
    this._transactionService = transactionService
    this._sendIntervalId = undefined
  }

  init () {
    this._zoneService.initialize(window.Zone.current)
    this.scheduleTransactionSend()
  }

  scheduleTransactionSend () {
    var self = this
    this._sendIntervalId = setInterval(function () {
      self.sendTransactionInterval()
    }, 5000)
  }

  setTransactionContextInfo (transaction) {
    var context = this._configService.get('context')
    if (context) {
      transaction.addContextInfo(context)
    }
  }

  sendTransactionInterval () {
    var logger = this._logginService
    var self = this
    var trService = this._transactionService

    var transactions = trService.getTransactions()
    if (transactions.length > 0) {
      var promise = self.sendTransactions(transactions)
      if (promise) {
        promise.then(undefined, function () {
          logger.debug('Failed sending transactions!')
        })
      }
      trService.clearTransactions()
      return promise
    }
  }
  sendTransactions (transactions) {
    var performanceMonitoring = this
    var browserResponsivenessInterval = this._configService.get('browserResponsivenessInterval')
    var checkBrowserResponsiveness = this._configService.get('checkBrowserResponsiveness')

    transactions.forEach(function (transaction) {
      transaction.spans.sort(function (spanA, spanB) {
        return spanA._start - spanB._start
      })

      if (performanceMonitoring._configService.get('groupSimilarSpans')) {
        var similarSpanThreshold = performanceMonitoring._configService.get('similarSpanThreshold')
        transaction.spans = performanceMonitoring.groupSmallContinuouslySimilarSpans(transaction, similarSpanThreshold)
      }
      performanceMonitoring.setTransactionContextInfo(transaction)
    })

    var filterTransactions = transactions.filter(function (tr) {
      if (checkBrowserResponsiveness && !tr.isHardNavigation) {
        var buffer = performanceMonitoring._configService.get('browserResponsivenessBuffer')

        var duration = tr.duration()
        var wasBrowserResponsive = performanceMonitoring.checkBrowserResponsiveness(tr, browserResponsivenessInterval, buffer)
        if (!wasBrowserResponsive) {
          performanceMonitoring._logginService.debug('Transaction was discarded! browser was not responsive enough during the transaction.', ' duration:', duration, ' browserResponsivenessCounter:', tr.browserResponsivenessCounter, 'interval:', browserResponsivenessInterval)
          return false
        }
      }
      return true
    })

    var payload = this.convertTransactionsToServerModel(filterTransactions)
    this._logginService.debug('Sending Transactions to apm server.', transactions.length)

    // todo: check if transactions are already being sent
    var promise = this._apmServer.sendTransactions(payload)
    return promise
  }

  convertTransactionsToServerModel (transactions) {
    return transactions.map(function (transaction) {
      var spans = transaction.spans.map(function (span) {
        return {
          name: span.signature,
          type: span.type,
          start: span._start,
          duration: span.duration()
        }
      })
      return {
        id: transaction.id,
        timestamp: transaction.timestamp,
        name: transaction.name,
        type: transaction.type,
        duration: transaction.duration(),
        spans: spans,
        context: transaction.contextInfo,
        marks: transaction.marks,
        unknownName: transaction.unknownName
      }
    })
  }

  groupSmallContinuouslySimilarSpans (transaction, threshold) {
    var transDuration = transaction.duration()
    var spans = []
    var lastCount = 1
    transaction.spans
      .forEach(function (span, index) {
        if (spans.length === 0) {
          spans.push(span)
        } else {
          var lastSpan = spans[spans.length - 1]

          var isContinuouslySimilar = lastSpan.type === span.type &&
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
