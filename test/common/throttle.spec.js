var throttle = require('../../src/common/throttle')

describe('throttle', function () {
  it('should throttle', function (done) {
    var counter = 0
    var throttled = 0
    var fn = throttle(function () {
      counter++
      return 'fn_result'
    }, function () {
      throttled++
      return 'throttle_result'
    }, {
      requestLimit: 2,
      interval: 100
    })

    var result = fn()
    expect(result).toBe('fn_result')
    expect(counter).toBe(1)
    fn()
    expect(counter).toBe(2)
    expect(throttled).toBe(0)

    result = fn()
    expect(counter).toBe(2)
    expect(throttled).toBe(1)
    expect(result).toBe('throttle_result')
    fn()
    expect(counter).toBe(2)
    expect(throttled).toBe(2)

    setTimeout(() => {
      fn()
      expect(counter).toBe(3)
      expect(throttled).toBe(2)

      fn()
      expect(counter).toBe(4)
      expect(throttled).toBe(2)

      fn()
      expect(counter).toBe(4)
      expect(throttled).toBe(3)
      done()
    }, 200)
  })

  it('should throttle 1 request per execution cycle', function (done) {
    var counter = 0
    var throttled = 0
    var fn = throttle(function () {
      counter++
      return 'fn_result'
    }, function () {
      throttled++
    }, {
      requestLimit: 1
    })
    var result = fn()
    expect(result).toBe('fn_result')
    expect(counter).toBe(1)
    expect(throttled).toBe(0)

    fn()
    expect(counter).toBe(1)
    expect(throttled).toBe(1)

    setTimeout(() => {
      fn()
      expect(counter).toBe(2)
      expect(throttled).toBe(1)

      fn()
      expect(counter).toBe(2)
      expect(throttled).toBe(2)

      done()
    }, 10)
  })
})
