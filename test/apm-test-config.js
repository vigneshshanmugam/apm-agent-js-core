module.exports = function () {
  return globalConfigs && globalConfigs.agentConfig || {
      serverUrl: 'http://localhost:8200',
      serviceName: 'test',
      agentName: 'apm-js-core',
      agentVersion: '0.0.1'
  }
}
