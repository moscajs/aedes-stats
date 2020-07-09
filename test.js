'use strict'

var test = require('tape').test
var mqtt = require('mqtt')
var aedes = require('aedes')
var stats = require('./stats')
var net = require('net')
var QlobberTrue = require('qlobber').QlobberTrue
var matcher = new QlobberTrue({ wildcard_one: '+', wildcard_some: '#' })
var port = 1889
var clients = 0
var server

function setup () {
  var instance = aedes()
  stats(instance)
  if (server && server.listening) {
    server.close()
  }
  server = net.createServer(instance.handle)
  server.listen(port)
  return {
    instance,
    server
  }
}

function connect (s, opts = {}) {
  s = Object.create(s)
  var client = mqtt.connect({
    port: port,
    host: '127.0.0.1',
    clean: true,
    clientId: opts.clientId || 'my-client-' + clients++,
    keepalive: opts.keepAlive || 200
  })
  client.on('end', function () {
    if (s.instance.connectedClients > 1) {
      return
    }
    s.instance.close()
    s.server.close()
  })
  return client
}

function checkTopic (actual, expected) {
  matcher.clear()
  matcher.add(expected)
  var bool = matcher.match(expected, actual)
  matcher.clear()
  return bool
}

test('Connect a client and subscribe to get total number of clients', function (t) {
  t.plan(2)

  var sysTopic = '$SYS/+/clients/total'
  var subscriber = connect(setup())

  subscriber.subscribe(sysTopic)

  subscriber.on('message', function (topic, message) {
    t.ok(checkTopic(topic, sysTopic))
    t.equal('1', message.toString(), 'clients connected')
    subscriber.end()
    t.end()
  })
})

test('Connect a client and subscribe to get maximum number of clients', function (t) {
  t.plan(2)

  var sysTopic = '$SYS/+/clients/maximum'
  var s = setup()
  var subscriber = connect(s, { clientId: 'subscriber' })
  var additionalClient = connect(s, { clientId: 'client' })

  subscriber.subscribe(sysTopic)

  subscriber.on('message', function (topic, message) {
    t.ok(checkTopic(topic, sysTopic))
    t.equal('2', message.toString(), 'clients connected')
    subscriber.end()
    additionalClient.end()
    t.end()
  })
})

test('Connect a client and subscribe to get current broker time', function (t) {
  t.plan(2)

  var sysTopic = '$SYS/+/time'
  var s = setup()
  var subscriber = connect(s, { clientId: 'subscriber' })
  var additionalClient = connect(s, { clientId: 'client' })

  subscriber.subscribe(sysTopic)

  subscriber.on('message', function (topic, message) {
    t.ok(checkTopic(topic, sysTopic))
    t.equal(s.instance.stats.time.toISOString(), message.toString(), 'current broker time')
    subscriber.end()
    additionalClient.end()
    t.end()
  })
})

test('Connect a client and subscribe to get broker up-time', function (t) {
  t.plan(2)

  var sysTopic = '$SYS/+/uptime'
  var s = setup()
  var subscriber = connect(s)

  subscriber.subscribe(sysTopic)

  subscriber.on('message', function (topic, message) {
    t.ok(checkTopic(topic, sysTopic))
    var seconds = Math.round((s.instance.stats.time - s.instance.stats.started) / 1000)
    t.equal(seconds.toString(), message.toString(), 'Broker uptime')
    subscriber.end()
    t.end()
  })
})

test('Connect a client and subscribe to get the number of published messages', function (t) {
  t.plan(2)

  var sysTopic = '$SYS/+/messages/publish/sent'
  var publisher = connect(setup())

  publisher.subscribe(sysTopic, onSub)

  function onSub () {
    publisher.publish('publishing', 'hey there')
    publisher.publish('publishing', 'hey there')
  }

  publisher.on('message', function (topic, message) {
    t.ok(checkTopic(topic, sysTopic))
    t.equal('2', message.toString(), 'number of published messages')
    publisher.end()
  })
})

test('Connect a client and and subscribe to get current heap usage', function (t) {
  t.plan(2)

  var sysTopic = '$SYS/+/memory/heap/current'
  var subscriber = connect(setup())

  subscriber.subscribe(sysTopic)

  subscriber.on('message', function (topic, message) {
    t.ok(checkTopic(topic, sysTopic))
    t.pass(message.toString(), 'bytes of heap used currently')
    subscriber.end()
    t.end()
  })
})

test('Connect a client and subscribe to get maximum heap usage', function (t) {
  t.plan(2)

  var sysTopic = '$SYS/+/memory/heap/maximum'
  var subscriber = connect(setup())

  subscriber.subscribe(sysTopic)

  subscriber.on('message', function (topic, message) {
    t.ok(checkTopic(topic, sysTopic))
    t.pass(message.toString(), 'max bytes of heap used till now')
    subscriber.end()
    t.end()
  })
})

test('Connect a client and subscribe to get cpu usage', function (t) {
  t.plan(2)

  var sysTopic = '$SYS/+/cpu/usage'
  var subscriber = connect(setup())

  subscriber.subscribe(sysTopic)

  subscriber.on('message', function (topic, message) {
    t.ok(checkTopic(topic, sysTopic))
    t.pass(message.toString(), 'cpu usage')
    subscriber.end()
    t.end()
  })
})

test('Connect a client and subscribe to get cpu avg of last 1 min', function (t) {
  t.plan(2)

  var sysTopic = '$SYS/+/cpu/avg/last/1'
  var subscriber = connect(setup())

  subscriber.subscribe(sysTopic)

  subscriber.on('message', function (topic, message) {
    t.ok(checkTopic(topic, sysTopic))
    t.pass(message.toString(), 'cpu avg of last 1 min')
    subscriber.end()
    t.end()
  })
})

test('Connect a client and subscribe to get cpu avg of last 5 min', function (t) {
  t.plan(2)

  var sysTopic = '$SYS/+/cpu/avg/last/5'
  var subscriber = connect(setup())

  subscriber.subscribe(sysTopic)

  subscriber.on('message', function (topic, message) {
    t.ok(checkTopic(topic, sysTopic))
    t.pass(message.toString(), 'cpu avg of last 5 min')
    subscriber.end()
    t.end()
  })
})

test('Connect a client and subscribe to get cpu avg of last 15 min', function (t) {
  t.plan(2)

  var sysTopic = '$SYS/+/cpu/avg/last/15'
  var subscriber = connect(setup())

  subscriber.subscribe(sysTopic)

  subscriber.on('message', function (topic, message) {
    t.ok(checkTopic(topic, sysTopic))
    t.pass(message.toString(), 'cpu avg of last 15 min')
    subscriber.end()
    t.end()
  })
})
