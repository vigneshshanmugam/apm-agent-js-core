var Queue = require('./queue')
var throttle = require('./throttle')
var utils = require('./utils')
var NDJSON = require('./ndjson')
var xhrIgnore = require('./patching/patch-utils').XHR_IGNORE

class ApmServer {
  constructor (configService, loggingService) {
    this._configService = configService
    this._loggingService = loggingService
    this.logMessages = {
      invalidConfig: { message: 'Configuration is invalid!', level: 'warn' }
    }

    this.errorQueue = undefined
    this.transactionQueue = undefined

    this.throttleAddError = undefined
    this.throttleAddTransaction = undefined

    this.initialized = false
    this.ndjsonSpan = {}
  }

  init () {
    if (this.initialized) {
      return
    }
    this.initialized = true

    this.initErrorQueue()
    this.initTransactionQueue()
  }

  createServiceObject () {
    var cfg = this._configService
    var stringLimit = cfg.get('serverStringLimit')

    var serviceObject = {
      name: utils.sanitizeString(cfg.get('serviceName'), stringLimit, true),
      version: utils.sanitizeString(cfg.get('serviceVersion'), stringLimit, false),
      agent: {
        name: cfg.get('agentName'),
        version: cfg.get('agentVersion')
      },
      language: {
        name: 'javascript'
      }
    }
    return serviceObject
  }

  _postJson (endPoint, payload) {
    return this._makeHttpRequest('POST', endPoint, payload, {
      'Content-Type': 'application/x-ndjson'
    })
  }

  _makeHttpRequest (method, url, payload, headers) {
    return new Promise(function (resolve, reject) {
      var xhr = new window.XMLHttpRequest()
      xhr[xhrIgnore] = true
      xhr.open(method, url, true)
      xhr.timeout = 10000

      if (headers) {
        for (var header in headers) {
          if (headers.hasOwnProperty(header)) {
            xhr.setRequestHeader(header, headers[header])
          }
        }
      }

      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          var status = xhr.status
          if (status === 0 || (status > 399 && status < 600)) {
            // An http 4xx or 5xx error. Signal an error.
            var err = new Error(url + ' HTTP status: ' + status)
            err.xhr = xhr
            reject(err)
          } else {
            resolve(xhr.responseText)
          }
        }
      }

      xhr.onerror = function (err) {
        reject(err)
      }

      xhr.send(payload)
    })
  }

  _createQueue (onFlush) {
    var queueLimit = this._configService.get('queueLimit')
    var flushInterval = this._configService.get('flushInterval')
    return new Queue(onFlush, {
      queueLimit: queueLimit,
      flushInterval: flushInterval
    })
  }

  initErrorQueue () {
    var apmServer = this
    if (this.errorQueue) {
      this.errorQueue.flush()
    }
    this.errorQueue = this._createQueue(function (errors) {
      var p = apmServer.sendErrors(errors)
      if (p) {
        p.then(undefined, function (reason) {
          apmServer._loggingService.warn('Failed sending errors!', reason)
        })
      }
    })

    var limit = apmServer._configService.get('errorThrottleLimit')
    var interval = apmServer._configService.get('errorThrottleInterval')

    this.throttleAddError = throttle(
      this.errorQueue.add.bind(this.errorQueue),
      function () {
        apmServer._loggingService.warn('Dropped error due to throttling!')
      },
      {
        limit: limit,
        interval: interval
      }
    )
  }

  initTransactionQueue () {
    var apmServer = this
    if (this.transactionQueue) {
      this.transactionQueue.flush()
    }
    this.transactionQueue = this._createQueue(function (transactions) {
      var p = apmServer.sendTransactions(transactions)
      if (p) {
        p.then(undefined, function (reason) {
          apmServer._loggingService.warn('Failed sending transactions!', reason)
        })
      }
    })

    var limit = apmServer._configService.get('transactionThrottleLimit')
    var interval = apmServer._configService.get('transactionThrottleInterval')

    this.throttleAddTransaction = throttle(
      this.transactionQueue.add.bind(this.transactionQueue),
      function () {
        apmServer._loggingService.warn('Dropped transaction due to throttling!')
      },
      {
        limit: limit,
        interval: interval
      }
    )
  }

  addError (error) {
    if (this._configService.isActive()) {
      if (!this.errorQueue) {
        this.initErrorQueue()
      }
      this.throttleAddError(error)
    }
  }

  addTransaction (transaction) {
    if (this._configService.isActive()) {
      if (!this.transactionQueue) {
        this.initTransactionQueue()
      }
      this.throttleAddTransaction(transaction)
    }
  }

  warnOnce (logObject) {
    if (logObject.level === 'warn') {
      logObject.level = 'debug'
      this._loggingService.warn(logObject.message)
    } else {
      this._loggingService.debug(logObject.message)
    }
  }

  ndjsonErrors (errors) {
    return errors.map(function (error) {
      return NDJSON.stringify({ error: error })
    })
  }

  sendErrors (errors) {
    if (this._configService.isValid() && this._configService.isActive()) {
      if (errors && errors.length > 0) {
        var payload = {
          service: this.createServiceObject(),
          errors: errors
        }

        payload = this._configService.applyFilters(payload)
        if (payload) {
          var endPoint = this._configService.getEndpointUrl('errors')
          var ndjson = this.ndjsonErrors(payload.errors)
          ndjson.unshift(NDJSON.stringify({ metadata: { service: payload.service } }))
          var ndjsonPayload = ndjson.join('')
          return this._postJson(endPoint, ndjsonPayload)
        } else {
          this._loggingService.warn('Dropped payload due to filtering!')
        }
      }
    } else {
      this.warnOnce(this.logMessages.invalidConfig)
    }
  }

  ndjsonTransactions (transactions) {
    var ndjsonSpan = this.ndjsonSpan
    return transactions.map(function (tr) {
      var spans = ''
      if (tr.spans) {
        spans = tr.spans
          .map(function (sp) {
            ndjsonSpan.span = sp
            return NDJSON.stringify(ndjsonSpan)
          })
          .join('')
        delete tr.spans
      }
      return NDJSON.stringify({ transaction: tr }) + spans
    })
  }

  sendTransactions (transactions) {
    if (this._configService.isValid() && this._configService.isActive()) {
      if (transactions && transactions.length > 0) {
        var payload = {
          service: this.createServiceObject(),
          transactions: transactions
        }
        payload = this._configService.applyFilters(payload)
        if (payload) {
          var endPoint = this._configService.getEndpointUrl('transactions')
          var ndjson = this.ndjsonTransactions(payload.transactions)
          ndjson.unshift(NDJSON.stringify({ metadata: { service: payload.service } }))
          var ndjsonPayload = ndjson.join('')
          return this._postJson(endPoint, ndjsonPayload)
        } else {
          this._loggingService.warn('Dropped payload due to filtering!')
        }
      }
    } else {
      this.warnOnce(this.logMessages.invalidConfig)
    }
  }
}

module.exports = ApmServer
