# aedes-stats

Stats for Aedes

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
