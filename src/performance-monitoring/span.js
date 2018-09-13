var utils = require('../common/utils')
const uuidv4 = require('uuid/v4')
class Span {
  constructor (signature, type, options) {
    this.id = uuidv4()
    var opts = options || {}
    if (typeof opts.onSpanEnd === 'function') {
      this.onSpanEnd = opts.onSpanEnd
    } else {
      this.onSpanEnd = function () {}
    }
    this.signature = signature
    this.type = type
    this.ended = false
    this._end = undefined
    this.context = undefined
    // Start timers
    this._start = window.performance.now()
  }
  end () {
    if (this.ended) {
      return
    }

    this._end = window.performance.now()

    this.ended = true
    this.onSpanEnd(this)
  }

  duration () {
    if (utils.isUndefined(this._end) || utils.isUndefined(this._start)) {
      return null
    }

    var diff = this._end - this._start

    return parseFloat(diff)
  }

  setContext (context) {
    if (!context) return
    this.context = utils.merge(this.context || {}, context)
  }
}

module.exports = Span
