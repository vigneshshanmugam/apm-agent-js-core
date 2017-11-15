var runSequence = require('run-sequence')
function taskFailed (err) {
  var exitCode = 2
  console.log('[ERROR] gulp build task failed', err)
  console.log('[FAIL] gulp build task failed - exiting with code ' + exitCode)
  return process.exit(exitCode)
}

function sequenceSucceeded (done) {
  console.log('All tasks completed.')
  done()
  return process.exit(0)
}

function runUnitTests (done) {
  var sequenceArgs = ['test', function (err) {
    if (err) {
      return taskFailed(err)
    } else {
      return sequenceSucceeded(done)
    }
  }]
  var isSauce = process.env.MODE && process.env.MODE.startsWith('saucelabs')
  if (isSauce) {
    sequenceArgs.unshift(['test:launchsauceconnect'])
  }
  runSequence.apply(this, sequenceArgs)
}

module.exports = {
  runUnitTests: runUnitTests
}
