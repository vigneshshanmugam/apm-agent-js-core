var Span = require('../../src/performance-monitoring/span')
describe('Span', function () {
    it('should return null for duration if not ended', function () {
        var s = new Span('test', 'test')
        expect(s.duration()).toBe(null)
    })
})