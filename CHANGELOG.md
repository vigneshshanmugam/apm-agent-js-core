<a name="0.6.0"></a>
# [0.6.0](https://github.com/elastic/apm-agent-js-core/compare/v0.5.1...v0.6.0) (2018-05-22)

### BREAKING CHANGES

* rename hasRouterLibrary to sendPageLoadTransaction


<a name="0.5.1"></a>
## [0.5.1](https://github.com/elastic/apm-agent-js-core/compare/v0.5.0...v0.5.1) (2018-05-01)



<a name="0.5.0"></a>
# [0.5.0](https://github.com/elastic/apm-agent-js-core/compare/v0.4.3...v0.5.0) (2018-04-23)


### Bug Fixes

* default custom for transaction type ([997c747](https://github.com/elastic/apm-agent-js-core/commit/997c747))


### Features

* ability to add navigation timing marks to any transaction ([e8c934c](https://github.com/elastic/apm-agent-js-core/commit/e8c934c))



<a name="0.4.3"></a>
## [0.4.3](https://github.com/elastic/apm-agent-js-core/compare/v0.4.2...v0.4.3) (2018-04-10)


### Bug Fixes

* **error-logging:** parsing error stack fails if error object is string ([6365b15](https://github.com/elastic/apm-agent-js-core/commit/6365b15))



<a name="0.4.2"></a>
## [0.4.2](https://github.com/elastic/apm-agent-js-core/compare/v0.4.1...v0.4.2) (2018-04-03)



<a name="0.4.1"></a>
## [0.4.1](https://github.com/elastic/apm-agent-js-core/compare/v0.4.0...v0.4.1) (2018-04-03)


### Bug Fixes

* **apm-server:** ignore falsy payload after filtering ([0bef5b6](https://github.com/elastic/apm-agent-js-core/commit/0bef5b6))



<a name="0.4.0"></a>
# [0.4.0](https://github.com/elastic/apm-agent-js-core/compare/v0.3.1...v0.4.0) (2018-03-27)


### Bug Fixes

* remove _debug from transaction context ([d2fc1b9](https://github.com/elastic/apm-agent-js-core/commit/d2fc1b9))
* remove query string from resource entries ([7507a5c](https://github.com/elastic/apm-agent-js-core/commit/7507a5c))


### Features

* add http.raw.url to span context ([45aaa5b](https://github.com/elastic/apm-agent-js-core/commit/45aaa5b))



<a name="0.3.1"></a>
## [0.3.1](https://github.com/elastic/apm-agent-js-core/compare/v0.3.0...v0.3.1) (2018-03-08)


### Bug Fixes

* payload span start time ([e30724f](https://github.com/elastic/apm-agent-js-core/commit/e30724f))



<a name="0.3.0"></a>
# [0.3.0](https://github.com/elastic/apm-agent-js-core/compare/v0.2.2...v0.3.0) (2018-03-06)


### Bug Fixes

* apply serverStringLimit to user context ([b24b038](https://github.com/elastic/apm-agent-js-core/commit/b24b038))
* minor improvements in navigation timing spans ([d1008d5](https://github.com/elastic/apm-agent-js-core/commit/d1008d5))
* review log levels and update logLevel lib ([b68db82](https://github.com/elastic/apm-agent-js-core/commit/b68db82))


### Features

* add LoggingService ([6f190ac](https://github.com/elastic/apm-agent-js-core/commit/6f190ac))
* add setTags to ConfigService ([5c65967](https://github.com/elastic/apm-agent-js-core/commit/5c65967))
* check isActive before adding items to the queue ([b372b35](https://github.com/elastic/apm-agent-js-core/commit/b372b35))



<a name="0.2.2"></a>
## [0.2.2](https://github.com/elastic/apm-agent-js-core/compare/v0.2.1...v0.2.2) (2018-02-16)


### Bug Fixes

* set descriptive names for navigation timing spans ([d270c78](https://github.com/elastic/apm-agent-js-core/commit/d270c78))


### Features

* enforce server string limit ([09ca8c6](https://github.com/elastic/apm-agent-js-core/commit/09ca8c6))



<a name="0.2.1"></a>
## [0.2.1](https://github.com/elastic/apm-agent-js-core/compare/v0.2.0...v0.2.1) (2018-02-07)



<a name="0.2.0"></a>
# [0.2.0](https://github.com/elastic/apm-agent-js-core/compare/v0.1.8...v0.2.0) (2018-02-06)


### BREAKING CHANGES

* ServiceFactory now requires init to be called


### Bug Fixes

* minor improvements to queue and throttle ([e2aae2c](https://github.com/elastic/apm-agent-js-core/commit/e2aae2c))
* remove transaction.unknownName ([b760c87](https://github.com/elastic/apm-agent-js-core/commit/b760c87))


### Features

* add Queue and throttle ([f987f41](https://github.com/elastic/apm-agent-js-core/commit/f987f41))
* throttle adding to both errorQueue and transactionQueue ([f1590f5](https://github.com/elastic/apm-agent-js-core/commit/f1590f5))



<a name="0.1.8"></a>
## [0.1.8](https://github.com/elastic/apm-agent-js-core/compare/v0.1.7...v0.1.8) (2018-01-10)



<a name="0.1.7"></a>
## [0.1.7](https://github.com/elastic/apm-agent-js-core/compare/v0.1.6...v0.1.7) (2018-01-10)


### Bug Fixes

* add language name to the payload ([ac39335](https://github.com/elastic/apm-agent-js-core/commit/ac39335))
* check config validity before sending the payload ([1486fd6](https://github.com/elastic/apm-agent-js-core/commit/1486fd6))



<a name="0.1.6"></a>
## [0.1.6](https://github.com/elastic/apm-agent-js-core/compare/v0.1.5...v0.1.6) (2018-01-09)



<a name="0.1.5"></a>
## [0.1.5](https://github.com/elastic/apm-agent-js-core/compare/v0.1.4...v0.1.5) (2018-01-08)



<a name="0.1.4"></a>
## [0.1.4](https://github.com/elastic/apm-agent-js-core/compare/v0.1.3...v0.1.4) (2018-01-05)


### Bug Fixes

* set default agentName to js-base ([3bfeb55](https://github.com/elastic/apm-agent-js-core/commit/3bfeb55))


### Features

* add marks data to the payload ([ec17bc7](https://github.com/elastic/apm-agent-js-core/commit/ec17bc7))
* add user context and custom context ([319e131](https://github.com/elastic/apm-agent-js-core/commit/319e131))



<a name="0.1.3"></a>
## [0.1.3](https://github.com/elastic/apm-agent-js-core/compare/v0.1.2...v0.1.3) (2018-01-05)


### Bug Fixes

* remove in_app field from stacktraces ([610cc6e](https://github.com/elastic/apm-agent-js-core/commit/610cc6e))


### Features

* add serviceVersion configuration ([c468338](https://github.com/elastic/apm-agent-js-core/commit/c468338))



<a name="0.1.2"></a>
## [0.1.2](https://github.com/jahtalab/apm-agent-js-core/compare/v0.1.1...v0.1.2) (2017-12-20)


### Bug Fixes

* **ApmServer:** don't send empty payload ([78c58ad](https://github.com/jahtalab/apm-agent-js-core/commit/78c58ad))



<a name="0.1.1"></a>
## [0.1.1](https://github.com/jahtalab/apm-agent-js-core/compare/v0.1.0...v0.1.1) (2017-12-13)



<a name="0.1.0"></a>
# [0.1.0](https://github.com/jahtalab/apm-agent-js-core/compare/v0.0.4...v0.1.0) (2017-12-13)


### BREAKING CHANGES

* rename apiOrigin to serverUrl
* rename app to service
* rename trace to span



<a name="0.0.4"></a>
## [0.0.4](https://github.com/jahtalab/apm-agent-js-core/compare/v0.0.3...v0.0.4) (2017-11-21)



<a name="0.0.3"></a>
## [0.0.3](https://github.com/jahtalab/apm-agent-js-core/compare/v0.0.2...v0.0.3) (2017-11-20)



<a name="0.0.2"></a>
## 0.0.2 (2017-11-14)



