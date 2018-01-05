var Span = require('./span')
var utils = require('../common/utils')
const uuidv4 = require('uuid/v4')

var Transaction = function (name, type, options, logger) {
  this.id = uuidv4()
  this.timestamp = new Date().toISOString()
  this.metadata = {}
  this.name = name
  this.type = type
  this.ended = false
  this._isDone = false
  this._options = options
  this._logger = logger
  if (typeof options === 'undefined') {
    this._options = {}
  }

  this.contextInfo = {
    _debug: {}
  }

  this.marks = {}
  if (this._options.sendVerboseDebugInfo) {
    this.contextInfo._debug.log = []
    this.debugLog('Transaction', name, type)
  }

  this.spans = []
  this._activeSpans = {}

  this._scheduledTasks = {}

  this.events = {}

  this.doneCallback = function noop () {}

  this._rootSpan = new Span('transaction', 'transaction', {enableStackFrames: false})

  this._startStamp = new Date()

  this.duration = this._rootSpan.duration.bind(this._rootSpan)
  this.nextId = 0

  this.isHardNavigation = false
}

Transaction.prototype.debugLog = function () {
  if (this._options.sendVerboseDebugInfo) {
    var messages = (arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments))
    messages.unshift(Date.now().toString())
    var textMessage = messages.join(' - ')
    this.contextInfo._debug.log.push(textMessage)
    if (this._logger) this._logger.debug(textMessage)
  }
}

Transaction.prototype.addContextInfo = function (obj) {
  utils.merge(this.contextInfo, obj)
}

Transaction.prototype.setDebugData = function setDebugData (key, value) {
  this.contextInfo._debug[key] = value
}

Transaction.prototype.addMarks = function (obj) {
  this.marks = utils.merge(this.marks, obj)
}

Transaction.prototype.redefine = function (name, type, options) {
  this.debugLog('redefine', name, type)
  this.name = name
  this.type = type
  this._options = options
}

Transaction.prototype.startSpan = function (signature, type, options) {
  // todo: should not accept more spans if the transaction is alreadyFinished
  var transaction = this
  this.debugLog('startSpan', signature, type)
  var opts = typeof options === 'undefined' ? {} : options
  opts.enableStackFrames = this._options.enableStackFrames === true && opts.enableStackFrames !== false

  opts.onSpanEnd = function (trc) {
    transaction._onSpanEnd(trc)
  }

  var span = new Span(signature, type, opts)
  span.id = this.nextId
  this.nextId++
  this._activeSpans[span.id] = span

  return span
}

Transaction.prototype.isFinished = function () {
  var scheduledTasks = Object.keys(this._scheduledTasks)
  this.debugLog('isFinished scheduledTasks', scheduledTasks)
  return (scheduledTasks.length === 0)
}

Transaction.prototype.detectFinish = function () {
  if (this.isFinished()) this.end()
}

Transaction.prototype.end = function () {
  if (this.ended) {
    return
  }
  this.debugLog('end')
  this.ended = true

  this.addContextInfo({
    url: {
      location: window.location.href
    }
  })
  this._rootSpan.end()

  if (this.isFinished() === true) {
    this._finish()
  }
}

Transaction.prototype.addTask = function (taskId) {
  // todo: should not accept more tasks if the transaction is alreadyFinished]
  this.debugLog('addTask', taskId)
  this._scheduledTasks[taskId] = taskId
}

Transaction.prototype.removeTask = function (taskId) {
  this.debugLog('removeTask', taskId)
  this.setDebugData('lastRemovedTask', taskId)
  delete this._scheduledTasks[taskId]
}

Transaction.prototype.addEndedSpans = function (existingSpans) {
  this.spans = this.spans.concat(existingSpans)
}

Transaction.prototype._onSpanEnd = function (span) {
  this.spans.push(span)
  span._scheduledTasks = Object.keys(this._scheduledTasks)
  // Remove span from _activeSpans
  delete this._activeSpans[span.id]
}

Transaction.prototype._finish = function () {
  if (this._alreadFinished === true) {
    return
  }

  this._alreadFinished = true

  this._adjustStartToEarliestSpan()
  this._adjustEndToLatestSpan()
  this.doneCallback(this)
}

Transaction.prototype._adjustEndToLatestSpan = function () {
  var latestSpan = findLatestNonXHRSpan(this.spans)

  if (latestSpan) {
    this._rootSpan._end = latestSpan._end

    // set all spans that now are longer than the transaction to
    // be truncated spans
    for (var i = 0; i < this.spans.length; i++) {
      var span = this.spans[i]
      if (span._end > this._rootSpan._end) {
        span._end = this._rootSpan._end
        span.type = span.type + '.truncated'
      }
    }
  }
}

Transaction.prototype._adjustStartToEarliestSpan = function () {
  var span = getEarliestSpan(this.spans)

  if (span && span._start < this._rootSpan._start) {
    this._rootSpan._start = span._start
  }
}

function findLatestNonXHRSpan (spans) {
  var latestSpan = null
  for (var i = 0; i < spans.length; i++) {
    var span = spans[i]
    if (span.type && span.type.indexOf('ext') === -1 &&
      span.type !== 'transaction' &&
      (!latestSpan || latestSpan._end < span._end)) {
      latestSpan = span
    }
  }
  return latestSpan
}

function getEarliestSpan (spans) {
  var earliestSpan = null

  spans.forEach(function (span) {
    if (!earliestSpan) {
      earliestSpan = span
    }
    if (earliestSpan && earliestSpan._start > span._start) {
      earliestSpan = span
    }
  })

  return earliestSpan
}

module.exports = Transaction
