var ConfigService = require('../../src/common/config-service')

describe('ConfigService', function () {
  var configService
  beforeEach(function () {
    configService = new ConfigService()
    configService.init()
  })
  it('should merge configs with already set configs', function () {
    expect(configService.get('debug')).toBe(false)
    expect(configService.get('appName')).toBe('')

    configService.setConfig({
      appName: 'appName'
    })

    expect(configService.get('debug')).toBe(false)
    expect(configService.get('appName')).toBe('appName')

    configService.setConfig({
      debug: true
    })

    expect(configService.get('debug')).toBe(true)
    expect(configService.get('appName')).toBe('appName')

    configService.setConfig({
      debug: false,
      appName: null
    })

    expect(configService.get('debug')).toBe(false)
    expect(configService.get('appName')).toBe(null)
  })

  xit('should deep merge configs', function () {
    expect(configService.get('performance.enable')).toBe(true)
    expect(configService.get('performance.enableStackFrames')).toBe(false)

    configService.setConfig({
      performance: {
        enableStackFrames: true
      }
    })

    expect(configService.get('performance.enable')).toBe(true)
    expect(configService.get('performance.enableStackFrames')).toBe(true)
  })

  it('should return undefined if the config does not exists', function () {
    expect(configService.get('context')).toEqual({})
    expect(configService.get('context.user')).toBe(undefined)
    configService.set('context.user', {test: 'test'})
    expect(configService.get('context.user')).toEqual({test: 'test'})
    expect(configService.get('nonexisting.nonexisting')).toBe(undefined)
    expect(configService.get('context.nonexisting.nonexisting')).toBe(undefined)
  })

  it('should addFilter correctly', function () {
    expect(function () {
      configService.addFilter('test')
    }).toThrow()

    configService.addFilter(function (testArg) {
      expect(testArg).toBe('hamid-test')
      return 'hamid-test-1'
    })

    configService.addFilter(function (testArg) {
      expect(testArg).toBe('hamid-test-1')
      return 'hamid-test-2'
    })

    var result = configService.applyFilters('hamid-test')
    expect(result).toBe('hamid-test-2')

    configService.addFilter(function () {})
    configService.addFilter(function () {
      throw new Error('Out of reach!')
    })

    result = configService.applyFilters('hamid-test')
    expect(result).toBeUndefined()
  })
})
