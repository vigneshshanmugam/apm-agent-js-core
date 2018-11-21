var patchUtils = require('./patch-utils')

const SCHEDULE = patchUtils.SCHEDULE
const INVOKE = patchUtils.INVOKE

const FETCH_SOURCE = patchUtils.FETCH_SOURCE

var alreadyPatched = false

function patchFetch (callback) {
  if (alreadyPatched) {
    return
  }
  alreadyPatched = true

  if (!window.fetch || !window.Request) {
    return
  }

  function scheduleTask (task) {
    task.state = SCHEDULE
    callback(SCHEDULE, task)
  }

  function invokeTask (task) {
    task.state = INVOKE
    callback(INVOKE, task)
  }

  var nativeFetch = window.fetch
  window.fetch = function (input, init) {
    var fetchSelf = this
    var args = arguments
    var request, url
    if (typeof input === 'string') {
      request = new Request(input, init)
      url = input
    } else if (input) {
      request = input
      url = request.url
    } else {
      return nativeFetch.apply(fetchSelf, args)
    }

    const task = {
      source: FETCH_SOURCE,
      state: '',
      type: 'macroTask',
      data: {
        target: request,
        method: request.method,
        sync: false,
        url: url,
        args: arguments,
        aborted: false
      }
    }

    return new Promise(function (resolve, reject) {
      patchUtils.globalState.fetchInProgress = true
      scheduleTask(task)
      var promise
      try {
        promise = nativeFetch.apply(fetchSelf, [request])
      } catch (error) {
        reject(error)
        task.data.error = error
        invokeTask(task)
        patchUtils.globalState.fetchInProgress = false
        return
      }

      promise.then(
        function (response) {
          resolve(response)
          task.data.response = response
          invokeTask(task)
        },
        function (error) {
          reject(error)
          task.data.error = error
          invokeTask(task)
        }
      )
      patchUtils.globalState.fetchInProgress = false
    })
  }
}

module.exports = {
  patchFetch: patchFetch
}
