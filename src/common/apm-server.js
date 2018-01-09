class ApmServer {
  constructor (configService, loggingService) {
    this._configService = configService
    this._loggingService = loggingService
    this.logMessages = {
      invalidConfig: { message: 'Configuration is invalid!', level: 'warn' }
    }
  }

  createServiceObject () {
    var cfg = this._configService
    var serviceObject = {
      name: cfg.get('serviceName'),
      version: cfg.get('serviceVersion'),
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
    return this._makeHttpRequest('POST',
      endPoint,
      JSON.stringify(payload),
      {'Content-Type': 'application/json'})
  }

  _makeHttpRequest (method, url, payload, headers) {
    return new Promise(function (resolve, reject) {
      var xhr = new window.XMLHttpRequest()
      xhr.open(method, url, true)
      xhr.timeout = 10000

      if (headers) {
        for (var header in headers) {
          if (headers.hasOwnProperty(header)) {
            xhr.setRequestHeader(header, headers[header])
          }
        }
      }

      xhr.onreadystatechange = function (evt) {
        if (xhr.readyState === 4) {
          var status = xhr.status
          if (status === 0 || status > 399 && status < 600) {
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

  warnOnce (logObject) {
    if (logObject.level === 'warn') {
      logObject.level = 'debug'
      this._loggingService.warn(logObject.message)
    } else {
      this._loggingService.debug(logObject.message)
    }
  }

  sendErrors (errors) {
    if (this._configService.isValid()) {
      if (errors && errors.length > 0) {
        var payload = {
          service: this.createServiceObject(),
          errors: errors
        }
        payload = this._configService.applyFilters(payload)
        var endPoint = this._configService.getEndpointUrl('errors')
        return this._postJson(endPoint, payload)
      }
    } else {
      this.warnOnce(this.logMessages.invalidConfig)
    }
  }

  sendTransactions (transactions) {
    if (this._configService.isValid()) {
      if (transactions && transactions.length > 0) {
        var payload = {
          service: this.createServiceObject(),
          transactions: transactions
        }
        payload = this._configService.applyFilters(payload)
        var endPoint = this._configService.getEndpointUrl('transactions')
        return this._postJson(endPoint, payload)
      }
    } else {
      this.warnOnce(this.logMessages.invalidConfig)
    }
  }

}

module.exports = ApmServer
