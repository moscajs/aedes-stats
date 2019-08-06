'use strict'

var test = require('tape').test
var mqtt = require('mqtt')
var aedes = require('aedes')
var stats = require('./stats')
var net = require('net')
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

test('Connect a client and subscribe to get total number of clients', function (t) {
  t.plan(1)

  var subscriber = connect(setup())

  subscriber.subscribe('$SYS/+/clients/total')

  subscriber.on('message', function (topic, message) {
    t.equal('1', message.toString(), 'clients connected')
    subscriber.end()
    t.end()
  })
})

test('Connect a client and subscribe to get maximum number of clients', function (t) {
  t.plan(1)

  var s = setup()
  var subscriber = connect(s, { clientId: 'subscriber' })
  var additionalClient = connect(s, { clientId: 'client' })

  subscriber.subscribe('$SYS/+/clients/maximum')

  subscriber.on('message', function (topic, message) {
    t.equal('2', message.toString(), 'clients connected')
    subscriber.end()
    additionalClient.end()
    t.end()
  })
})

test('Connect a client and subscribe to get current broker time', function (t) {
  t.plan(1)

  var s = setup()
  var subscriber = connect(s, { clientId: 'subscriber' })
  var additionalClient = connect(s, { clientId: 'client' })

  subscriber.subscribe('$SYS/+/time')

  subscriber.on('message', function (topic, message) {
    t.equal(s.instance.stats.time.toISOString(), message.toString(), 'current broker time')
    subscriber.end()
    additionalClient.end()
    t.end()
  })
})

test('Connect a client and subscribe to get broker up-time', function (t) {
  t.plan(1)

  var s = setup()
  var subscriber = connect(s)

  subscriber.subscribe('$SYS/+/uptime')

  subscriber.on('message', function (topic, message) {
    var seconds = Math.round((s.instance.stats.time - s.instance.stats.started) / 1000)
    t.equal(seconds.toString(), message.toString(), 'Broker uptime')
    subscriber.end()
    t.end()
  })
})

test('Connect a client and subscribe to get the number of published messages', function (t) {
  t.plan(1)

  var publisher = connect(setup())

  publisher.subscribe('$SYS/+/messages/publish/sent', onSub)

  function onSub () {
    publisher.publish('publishing', 'hey there')
    publisher.publish('publishing', 'hey there')
  }

  publisher.on('message', function (topic, message) {
    t.equal('2', message.toString(), 'number of published messages')
    publisher.end()
  })
})

test('Connect a client and and subscribe to get current heap usage', function (t) {
  t.plan(1)

  var subscriber = connect(setup())

  subscriber.subscribe('$SYS/+/memory/heap/current')

  subscriber.on('message', function (topic, message) {
    t.pass(message.toString(), 'bytes of heap used currently')
    subscriber.end()
    t.end()
  })
})

test('Connect a client and and subscribe to get maximum heap usage', function (t) {
  t.plan(1)

  var subscriber = connect(setup())

  subscriber.subscribe('$SYS/+/memory/heap/maximum')

  subscriber.on('message', function (topic, message) {
    t.pass(message.toString(), 'max bytes of heap used till now')
    subscriber.end()
    t.end()
  })
})
