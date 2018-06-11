
var navigationTiming = require('../../src/performance-monitoring/capture-hard-navigation')

var resourceEntries = require('./resource-entries.js')

var spanSnapshot = [
    { "signature": "http://testing.com", "type": "resource.script", "ended": true, "_end": 168.25, "context": { "http": { "url": { "raw": "http://testing.com" } } }, "_start": 25.220000000000002 }, { "signature": "http://localhost:9876/base/node_modules/karma-jasmine/lib/boot.js", "type": "resource.script", "ended": true, "_end": 172.8, "context": { "http": { "url": { "raw": "http://localhost:9876/base/node_modules/karma-jasmine/lib/boot.js?945a38bf4e45ad2770eb94868231905a04a0bd3e" } } }, "_start": 25.385 }, { "signature": "http://localhost:9876/base/node_modules/karma-jasmine/lib/adapter.js", "type": "resource.script", "ended": true, "_end": 174.04500000000002, "context": { "http": { "url": { "raw": "http://localhost:9876/base/node_modules/karma-jasmine/lib/adapter.js?1e4f995124c2f01998fd4f3e16ace577bf155ba9" } } }, "_start": 25.515000000000004 }, { "signature": "http://localhost:9876/base/tmp/globals.js", "type": "resource.script", "ended": true, "_end": 175.33, "context": { "http": { "url": { "raw": "http://localhost:9876/base/tmp/globals.js?2bb0399ca4cd37090f3846e0b277f280c8e3e9fe" } } }, "_start": 25.640000000000004 }, { "signature": "http://localhost:9876/base/node_modules/elastic-apm-js-zone/dist/zone.js", "type": "resource.script", "ended": true, "_end": 176.12000000000003, "context": { "http": { "url": { "raw": "http://localhost:9876/base/node_modules/elastic-apm-js-zone/dist/zone.js?f5c50b5700ad20ee9b4a77b87668194c3e1fd854" } } }, "_start": 25.76 }, { "signature": "http://localhost:9876/base/test/utils/polyfill.js", "type": "resource.script", "ended": true, "_end": 176.865, "context": { "http": { "url": { "raw": "http://localhost:9876/base/test/utils/polyfill.js?6fc35a7768d983f48c91a59b2684c94034649b7b" } } }, "_start": 25.880000000000003 }, { "signature": "http://localhost:9876/base/test/common/apm-server.spec.js", "type": "resource.script", "ended": true, "_end": 340.65500000000003, "context": { "http": { "url": { "raw": "http://localhost:9876/base/test/common/apm-server.spec.js?df690a94bba8303d7ef5e9d15b51f7ef74574814" } } }, "_start": 26.000000000000004 }, { "signature": "http://localhost:9876/base/test/common/config-service.spec.js", "type": "resource.script", "ended": true, "_end": 178.85000000000002, "context": { "http": { "url": { "raw": "http://localhost:9876/base/test/common/config-service.spec.js?889e88d47d45948d3f220bec7a613431096facee" } } }, "_start": 26.150000000000002 }, { "signature": "http://localhost:9876/base/test/common/service-factory.spec.js", "type": "resource.script", "ended": true, "_end": 180.935, "context": { "http": { "url": { "raw": "http://localhost:9876/base/test/common/service-factory.spec.js?a6fd2f6a53d3759b5005ac31a54b998b9773304b" } } }, "_start": 26.285000000000004 }, { "signature": "http://localhost:9876/base/test/common/utils.spec.js", "type": "resource.script", "ended": true, "_end": 181.735, "context": { "http": { "url": { "raw": "http://localhost:9876/base/test/common/utils.spec.js?a6be2b3e33f1898e7d92afeb63988940c991de93" } } }, "_start": 26.405 }, { "signature": "http://localhost:9876/base/test/error-logging/error-logging.spec.js", "type": "resource.script", "ended": true, "_end": 349.685, "context": { "http": { "url": { "raw": "http://localhost:9876/base/test/error-logging/error-logging.spec.js?a6907ca77c364fa115e18ed34f15cb3ddd12a8a7" } } }, "_start": 26.520000000000003 }, { "signature": "http://localhost:9876/base/test/error-logging/stack-trace-service.spec.js", "type": "resource.script", "ended": true, "_end": 350.44000000000005, "context": { "http": { "url": { "raw": "http://localhost:9876/base/test/error-logging/stack-trace-service.spec.js?ebb9fb5e90b1cf7b286c2b26daeed51f86c57545" } } }, "_start": 26.635 }, { "signature": "http://localhost:9876/base/test/performance-monitoring/performance-monitoring.spec.js", "type": "resource.script", "ended": true, "_end": 351.72, "context": { "http": { "url": { "raw": "http://localhost:9876/base/test/performance-monitoring/performance-monitoring.spec.js?a3d8e3aa88d6f7c94386d195420602b872a662f5" } } }, "_start": 26.755000000000003 }, { "signature": "http://localhost:9876/base/test/performance-monitoring/transaction-service.spec.js", "type": "resource.script", "ended": true, "_end": 257.22, "context": { "http": { "url": { "raw": "http://localhost:9876/base/test/performance-monitoring/transaction-service.spec.js?6456ebcc9d1a95033e60cde7a5e6144bdadeda53" } } }, "_start": 26.875000000000004 }, { "signature": "http://localhost:9876/base/test/performance-monitoring/transaction.spec.js", "type": "resource.script", "ended": true, "_end": 187.60500000000002, "context": { "http": { "url": { "raw": "http://localhost:9876/base/test/performance-monitoring/transaction.spec.js?24c11848ccdb46774cf56164f2db7166dde0ffb8" } } }, "_start": 27.035000000000004 }, { "signature": "http://localhost:9876/base/test/performance-monitoring/zone-service.spec.js", "type": "resource.script", "ended": true, "_end": 188.72000000000003, "context": { "http": { "url": { "raw": "http://localhost:9876/base/test/performance-monitoring/zone-service.spec.js?3ce84ffadbb223d4c7e2d349740137aff060aa47" } } }, "_start": 27.180000000000003 }
].map(mapSpan)

function mapSpan(s) { return { signature: s.signature, _end: s._end, _start: s._start } }

describe('navigationTiming', function () {
    it('should createNavigationTimingSpans', function () {
        var timings = {
            "navigationStart": 1528373292350,
            "unloadEventStart": 1528373293147,
            "unloadEventEnd": 1528373293147,
            "redirectStart": 0,
            "redirectEnd": 0,
            "fetchStart": 1528373292356,
            "domainLookupStart": 1528373292356,
            "domainLookupEnd": 1528373292356,
            "connectStart": 1528373292356,
            "connectEnd": 1528373292356,
            "secureConnectionStart": 0,
            "requestStart": 1528373292363,
            "responseStart": 1528373293142,
            "responseEnd": 1528373293303,
            "domLoading": 1528373293176,
            "domInteractive": 1528373293820,
            "domContentLoadedEventStart": 1528373293820,
            "domContentLoadedEventEnd": 1528373293854,
            "domComplete": 1528373295207,
            "loadEventStart": 1528373295208,
            "loadEventEnd": 1528373295230
        }


        var spans = navigationTiming.createNavigationTimingSpans(timings, timings.fetchStart)
        expect(spans.map(mapSpan))
            .toEqual([
                { "signature": "Requesting the document, waiting for the first byte", "_end": 786, "_start": 7 },
                { "signature": "Receiving the document", "_end": 947, "_start": 786 },
                { "signature": "Parsing the document, executing sync. scripts", "_end": 1464, "_start": 820 },
                { "signature": "Fire \"DOMContentLoaded\" event", "_end": 1498, "_start": 1464 },
                { "signature": "Fire \"load\" event", "_end": 2874, "_start": 2852 }
            ])

        spans = navigationTiming.createNavigationTimingSpans(timings, null)
        expect(spans).toEqual([])
        spans = navigationTiming.createNavigationTimingSpans(timings, undefined)
        expect(spans).toEqual([])
        spans = navigationTiming.createNavigationTimingSpans(timings, 0)
        expect(spans).toEqual([])
        spans = navigationTiming.createNavigationTimingSpans(timings, 1)
        expect(spans).toEqual([])
        spans = navigationTiming.createNavigationTimingSpans(timings, Number(new Date()))
        expect(spans).toEqual([])

        timings.requestStart = null
        spans = navigationTiming.createNavigationTimingSpans(timings, timings.fetchStart)
        expect(spans.map(mapSpan))
            .toEqual([
                { "signature": "Receiving the document", "_end": 947, "_start": 786 },
                { "signature": "Parsing the document, executing sync. scripts", "_end": 1464, "_start": 820 },
                { "signature": "Fire \"DOMContentLoaded\" event", "_end": 1498, "_start": 1464 },
                { "signature": "Fire \"load\" event", "_end": 2874, "_start": 2852 }
            ])

        timings.requestStart = undefined
        spans = navigationTiming.createNavigationTimingSpans(timings, timings.fetchStart)
        expect(spans.map(mapSpan))
            .toEqual([
                { "signature": "Receiving the document", "_end": 947, "_start": 786 },
                { "signature": "Parsing the document, executing sync. scripts", "_end": 1464, "_start": 820 },
                { "signature": "Fire \"DOMContentLoaded\" event", "_end": 1498, "_start": 1464 },
                { "signature": "Fire \"load\" event", "_end": 2874, "_start": 2852 }
            ])

        timings.requestStart = 0
        spans = navigationTiming.createNavigationTimingSpans(timings, timings.fetchStart)
        expect(spans.map(mapSpan))
            .toEqual([
                { "signature": "Receiving the document", "_end": 947, "_start": 786 },
                { "signature": "Parsing the document, executing sync. scripts", "_end": 1464, "_start": 820 },
                { "signature": "Fire \"DOMContentLoaded\" event", "_end": 1498, "_start": 1464 },
                { "signature": "Fire \"load\" event", "_end": 2874, "_start": 2852 }
            ])

        timings.requestStart = 1
        spans = navigationTiming.createNavigationTimingSpans(timings, timings.fetchStart)
        expect(spans.map(mapSpan))
            .toEqual([
                { "signature": "Receiving the document", "_end": 947, "_start": 786 },
                { "signature": "Parsing the document, executing sync. scripts", "_end": 1464, "_start": 820 },
                { "signature": "Fire \"DOMContentLoaded\" event", "_end": 1498, "_start": 1464 },
                { "signature": "Fire \"load\" event", "_end": 2874, "_start": 2852 }
            ])

        timings.requestStart = Number(new Date())
        spans = navigationTiming.createNavigationTimingSpans(timings, timings.fetchStart)
        expect(spans.map(mapSpan))
            .toEqual([
                { "signature": "Receiving the document", "_end": 947, "_start": 786 },
                { "signature": "Parsing the document, executing sync. scripts", "_end": 1464, "_start": 820 },
                { "signature": "Fire \"DOMContentLoaded\" event", "_end": 1498, "_start": 1464 },
                { "signature": "Fire \"load\" event", "_end": 2874, "_start": 2852 }
            ])


        // testing the end 
        timings.domInteractive = null
        spans = navigationTiming.createNavigationTimingSpans(timings, timings.fetchStart)
        expect(spans.map(mapSpan))
            .toEqual([
                { "signature": "Receiving the document", "_end": 947, "_start": 786 },
                { "signature": "Fire \"DOMContentLoaded\" event", "_end": 1498, "_start": 1464 },
                { "signature": "Fire \"load\" event", "_end": 2874, "_start": 2852 }
            ])

        timings.domInteractive = undefined
        spans = navigationTiming.createNavigationTimingSpans(timings, timings.fetchStart)
        expect(spans.map(mapSpan))
            .toEqual([
                { "signature": "Receiving the document", "_end": 947, "_start": 786 },
                { "signature": "Fire \"DOMContentLoaded\" event", "_end": 1498, "_start": 1464 },
                { "signature": "Fire \"load\" event", "_end": 2874, "_start": 2852 }
            ])

        timings.domInteractive = 0
        spans = navigationTiming.createNavigationTimingSpans(timings, timings.fetchStart)
        expect(spans.map(mapSpan))
            .toEqual([
                { "signature": "Receiving the document", "_end": 947, "_start": 786 },
                { "signature": "Fire \"DOMContentLoaded\" event", "_end": 1498, "_start": 1464 },
                { "signature": "Fire \"load\" event", "_end": 2874, "_start": 2852 }
            ])

        timings.domInteractive = 1
        spans = navigationTiming.createNavigationTimingSpans(timings, timings.fetchStart)
        expect(spans.map(mapSpan))
            .toEqual([
                { "signature": "Receiving the document", "_end": 947, "_start": 786 },
                { "signature": "Fire \"DOMContentLoaded\" event", "_end": 1498, "_start": 1464 },
                { "signature": "Fire \"load\" event", "_end": 2874, "_start": 2852 }
            ])

        timings.domInteractive = Number(new Date())
        spans = navigationTiming.createNavigationTimingSpans(timings, timings.fetchStart)
        expect(spans.map(mapSpan))
            .toEqual([
                { "signature": "Receiving the document", "_end": 947, "_start": 786 },
                { "signature": "Fire \"DOMContentLoaded\" event", "_end": 1498, "_start": 1464 },
                { "signature": "Fire \"load\" event", "_end": 2874, "_start": 2852 }
            ])

        timings.domLoading = null
        timings.domInteractive = null
        spans = navigationTiming.createNavigationTimingSpans(timings, timings.fetchStart)
        expect(spans.map(mapSpan))
            .toEqual([
                { "signature": "Receiving the document", "_end": 947, "_start": 786 },
                { "signature": "Fire \"DOMContentLoaded\" event", "_end": 1498, "_start": 1464 },
                { "signature": "Fire \"load\" event", "_end": 2874, "_start": 2852 }
            ])

        timings.domLoading = undefined
        timings.domInteractive = undefined
        spans = navigationTiming.createNavigationTimingSpans(timings, timings.fetchStart)
        expect(spans.map(mapSpan))
            .toEqual([
                { "signature": "Receiving the document", "_end": 947, "_start": 786 },
                { "signature": "Fire \"DOMContentLoaded\" event", "_end": 1498, "_start": 1464 },
                { "signature": "Fire \"load\" event", "_end": 2874, "_start": 2852 }
            ])

        timings.domLoading = 0
        timings.domInteractive = 0
        spans = navigationTiming.createNavigationTimingSpans(timings, timings.fetchStart)
        expect(spans.map(mapSpan))
            .toEqual([
                { "signature": "Receiving the document", "_end": 947, "_start": 786 },
                { "signature": "Fire \"DOMContentLoaded\" event", "_end": 1498, "_start": 1464 },
                { "signature": "Fire \"load\" event", "_end": 2874, "_start": 2852 }
            ])


        timings.domLoading = 1
        timings.domInteractive = 1
        spans = navigationTiming.createNavigationTimingSpans(timings, timings.fetchStart)
        expect(spans.map(mapSpan))
            .toEqual([
                { "signature": "Receiving the document", "_end": 947, "_start": 786 },
                { "signature": "Fire \"DOMContentLoaded\" event", "_end": 1498, "_start": 1464 },
                { "signature": "Fire \"load\" event", "_end": 2874, "_start": 2852 }
            ])


        timings.domLoading = Number(new Date())
        timings.domInteractive = Number(new Date())
        spans = navigationTiming.createNavigationTimingSpans(timings, timings.fetchStart)
        expect(spans.map(mapSpan))
            .toEqual([
                { "signature": "Receiving the document", "_end": 947, "_start": 786 },
                { "signature": "Fire \"DOMContentLoaded\" event", "_end": 1498, "_start": 1464 },
                { "signature": "Fire \"load\" event", "_end": 2874, "_start": 2852 }
            ])


        timings.domContentLoadedEventStart = 'testing'
        timings.domContentLoadedEventEnd = 'testings'
        spans = navigationTiming.createNavigationTimingSpans(timings, timings.fetchStart)
        expect(spans.map(mapSpan))
            .toEqual([
                { "signature": "Receiving the document", "_end": 947, "_start": 786 },
                { "signature": "Fire \"load\" event", "_end": 2874, "_start": 2852 }
            ])
        // console.log(spans.map(s => `${s._start}, ${s._end}, ${s.duration()}, ${s.signature}`).join('\n'))
    })


    it('should createResourceTimingSpans', function () {
        var spans = navigationTiming.createResourceTimingSpans(resourceEntries, [])
        expect(spans.map(mapSpan)).toEqual(spanSnapshot)
    })
})



