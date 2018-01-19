function throttle (fn, onThrottle, opts) {
  var context = opts.context || this
  var limit = opts.limit
  var interval = opts.interval
  var countFn = opts.countFn || function () {}
  var counter = 0
  var timeoutId
  return function () {
    var count = typeof countFn === 'function' && countFn.apply(context, arguments)
    if (typeof count !== 'number') {
      count = 1
    }
    counter = counter + count
    if (typeof timeoutId === 'undefined') {
      timeoutId = setTimeout(function () {
        counter = 0
        timeoutId = undefined
      }, interval)
    }
    if (counter > limit) {
      if (typeof onThrottle === 'function') {
        return onThrottle.apply(context, arguments)
      }
    } else {
      return fn.apply(context, arguments)
    }
  }
}

module.exports = throttle
