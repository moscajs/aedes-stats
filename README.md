# aedes-stats

![ci](https://github.com/moscajs/aedes-stats/workflows/ci/badge.svg)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](http://standardjs.com/)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/moscajs/aedes-stats/graphs/commit-activity)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/moscajs/aedes-stats/pulls)\
[![Total alerts](https://img.shields.io/lgtm/alerts/g/moscajs/aedes-stats.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/moscajs/aedes-stats/alerts/)
[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/moscajs/aedes-stats.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/moscajs/aedes-stats/context:javascript)
[![Coverage Status](https://coveralls.io/repos/moscajs/aedes-stats/badge.svg?branch=main&service=github)](https://coveralls.io/github/moscajs/aedes-stats?branch=main)
[![Known Vulnerabilities](https://snyk.io/test/github/moscajs/aedes-stats/badge.svg)](https://snyk.io/test/github/moscajs/aedes-stats)\
![node](https://img.shields.io/node/v/aedes-stats)
[![NPM version](https://img.shields.io/npm/v/aedes-stats.svg?style=flat)](https://www.npmjs.com/package/aedes-stats)
[![NPM downloads](https://img.shields.io/npm/dm/aedes-stats.svg?style=flat)](https://www.npmjs.com/package/aedes-stats)

[![opencollective](https://opencollective.com/aedes/donate/button.png)](https://opencollective.com/aedes/donate)

Stats for [Aedes](http://npm.im/aedes)

## Install

```sh
npm i aedes aedes-stats --save
```

## Example

```js
var aedes = require('aedes')
var stats = require('aedes-stats')
var instance = aedes()

stats(instance)
```

## Options

An object containing options can be passed in as the second argument to `stats`.

* `interval`: ms to wait between publishing stats (defaults to 1000)

## Topics and Stats published

* `$SYS/{ID}/uptime`
* `$SYS/{ID}/time`
* `$SYS/{ID}/clients/total`
* `$SYS/{ID}/clients/maximum`
* `$SYS/{ID}/messages/publish/sent`
* `$SYS/{ID}/memory/heap/current`
* `$SYS/{ID}/memory/heap/maximum`

Where `{ID}` is the `aedes` instance id.

## License

MIT
