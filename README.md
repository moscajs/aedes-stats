# aedes-stats
[![Build Status](https://travis-ci.org/mcollina/aedes-stats.svg?branch=master)](https://travis-ci.org/mcollina/aedes-stats)
[![Dependencies Status](https://david-dm.org/mcollina/aedes-stats/status.svg)](https://david-dm.org/mcollina/aedes-stats)
[![devDependencies Status](https://david-dm.org/mcollina/aedes-stats/dev-status.svg)](https://david-dm.org/mcollina/aedes-stats?type=dev)
<br/>
[![Known Vulnerabilities](https://snyk.io/test/github/mcollina/aedes-stats/badge.svg)](https://snyk.io/test/github/mcollina/aedes-stats)
[![Coverage Status](https://coveralls.io/repos/mcollina/aedes-stats/badge.svg?branch=master&service=github)](https://coveralls.io/github/mcollina/aedes-stats?branch=master)
[![NPM version](https://img.shields.io/npm/v/aedes-stats.svg?style=flat)](https://www.npmjs.com/package/aedes-stats)
[![NPM downloads](https://img.shields.io/npm/dm/aedes-stats.svg?style=flat)](https://www.npmjs.com/package/aedes-stats)

Stats for [Aedes](http://npm.im/aedes)

## Install

```
npm i aedes aedes-stats --save
```

## Example

```js
var aedes = require('aedes')
var stats = require('aedes-stats')
var instance = aedes()

stats(aedes)
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
