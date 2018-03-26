var utils = require('../common/utils')

function Span (signature, type, options) {
  var opts = options || {}
  if (typeof opts.onSpanEnd === 'function') {
    this.onSpanEnd = opts.onSpanEnd
  } else {
    this.onSpanEnd = function () {}
  }
  this.signature = signature
  this.type = type
  this.ended = false
  this._end = null
  this.context = null
  // Start timers
  this._start = window.performance.now()
}

Span.prototype.end = function () {
  this._end = window.performance.now()

  this.ended = true
  this.onSpanEnd(this)
}

Span.prototype.duration = function () {
  if (utils.isUndefined(this.ended) || utils.isUndefined(this._start)) {
    return null
  }

  var diff = this._end - this._start

  return parseFloat(diff)
}

Span.prototype.setContext = function (context) {
  if (!context) return
  this.context = utils.merge(this.context || {}, context)
}

module.exports = Span
