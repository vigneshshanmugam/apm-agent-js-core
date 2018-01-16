var PerformanceMonitoring = require('./performance-monitoring')
var TransactionService = require('./transaction-service')
var ZoneService = require('./zone-service')

module.exports = {
  PerformanceMonitoring: PerformanceMonitoring,
  registerServices: function registerServices (serviceFactory) {
    serviceFactory.registerServiceCreator('ZoneService', function () {
      var configService = serviceFactory.getService('ConfigService')
      var loggingService = serviceFactory.getService('LoggingService')
      return new ZoneService(loggingService, configService)
    })

    serviceFactory.registerServiceCreator('TransactionService', function () {
      var configService = serviceFactory.getService('ConfigService')
      var loggingService = serviceFactory.getService('LoggingService')
      var zoneService = serviceFactory.getService('ZoneService')
      return new TransactionService(zoneService, loggingService, configService)
    })

    serviceFactory.registerServiceCreator('PerformanceMonitoring', function () {
      var configService = serviceFactory.getService('ConfigService')
      var loggingService = serviceFactory.getService('LoggingService')
      var apmService = serviceFactory.getService('ApmServer')
      var zoneService = serviceFactory.getService('ZoneService')
      var transactionService = serviceFactory.getService('TransactionService')
      return new PerformanceMonitoring(apmService, configService, loggingService, zoneService, transactionService)
    })
  }
}
