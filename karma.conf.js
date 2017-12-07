var karmaUtils = require('./dev-utils/karma.js')

module.exports = function (config) {
  config.set(karmaUtils.baseConfig)
  var customConfig = {
    globalConfigs: {
      useMocks: false,
      agentConfig: {
        apiOrigin: 'http://localhost:8200',
        serviceName: 'test',
        agentName: 'apm-js-core',
        agentVersion: '0.0.1'
      }
    },
    testConfig: {
      sauceLabs: process.env.MODE && process.env.MODE.startsWith('saucelabs'),
      branch: process.env.TRAVIS_BRANCH,
      mode: process.env.MODE
    }
  }

  if (customConfig.testConfig.sauceLabs) {
    customConfig.globalConfigs.useMocks = true
  }
  console.log('customConfig:', customConfig)
  config.set(customConfig)
  config.files.unshift('test/utils/polyfill.js')
  config.files.unshift('node_modules/elastic-apm-js-zone/dist/zone.js')
  // config.files.push({ pattern: 'test/exceptions/data/*.js', included: false, watched: false })
  config.files.push({ pattern: 'src/**/*.js', included: false, watched: true })
  delete config.customLaunchers['SL_IOS8']

  var cfg = karmaUtils.prepareConfig(config)
  config.set(cfg)
}
