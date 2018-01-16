function throttle (fn, onThrottle, opts) {
  var context = opts.context || this
  var requestLimit = opts.requestLimit
  var interval = opts.interval
  var counter = 0
  var timeoutId
  return function () {
    counter++
    if (typeof timeoutId === 'undefined') {
      timeoutId = setTimeout(function () {
        counter = 0
        timeoutId = undefined
      }, interval)
    }
    if (counter > requestLimit) {
      if (typeof onThrottle === 'function') {
        return onThrottle(counter)
      }
    } else {
      return fn.apply(context, arguments)
    }
  }
}

module.exports = throttle
