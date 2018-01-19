class Queue {
  constructor (onFlush, opts) {
    if (!opts) opts = {}
    this.onFlush = onFlush
    this.items = []
    this.queueLimit = opts.queueLimit || -1
    this.flushInterval = opts.flushInterval || 0
    this.timeoutId = undefined
  }
  _setTimer () {
    this.timeoutId = setTimeout(() => {
      this.flush()
    }, this.flushInterval)
  }

  flush () {
    this.onFlush(this.items)
    this._clear()
  }

  _clear () {
    if (typeof this.timeoutId !== 'undefined') {
      clearTimeout(this.timeoutId)
      this.timeoutId = undefined
    }
    this.items = []
  }

  add (item) {
    this.items.push(item)
    if (this.queueLimit !== -1 && this.items.length >= this.queueLimit) {
      this.flush()
    } else {
      if (typeof this.timeoutId === 'undefined') {
        this._setTimer()
      }
    }
  }
}

module.exports = Queue
