var karmaUtils = require('./karma')
var saucelabsUtils = require('./saucelabs')

function runKarma (configFile) {
  function karmaCallback (exitCode) {
    if (exitCode) {
      return process.exit(exitCode)
    } else {
      console.log('Karma finished.')
      return process.exit(0)
    }
  }
  karmaUtils.singleRunKarma(configFile, karmaCallback)
}

function runUnitTests (testConfig) {
  if (testConfig.sauceLabs) {
    saucelabsUtils.launchSauceConnect(testConfig.sauceLabs, runKarma.bind(this, testConfig.karmaConfigFile))
  }else {
    runKarma(testConfig.karmaConfigFile)
  }
}

function getTestEnvironmentVariables () {
  var envVars = {
    branch: process.env.TRAVIS_BRANCH,
    mode: process.env.MODE,
    sauceLabs: process.env.MODE && process.env.MODE.startsWith('saucelabs')
  }
  if (envVars.sauceLabs) {
    envVars.sauceLabs = {
      username: process.env.SAUCE_USERNAME,
      accessKey: process.env.SAUCE_ACCESS_KEY
    }
  }
  return envVars
}
module.exports = {
  runUnitTests: runUnitTests,
  getTestEnvironmentVariables: getTestEnvironmentVariables,
  runKarma: runKarma
}
