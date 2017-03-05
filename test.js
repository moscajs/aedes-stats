'use strict'

var test = require('tape').test
var mqtt = require('mqtt')
var aedes = require('aedes')
var net = require('net')
var moment = require('moment')
var StatsInstance = require('./index')
var stats = new StatsInstance()
var port = 1889

test('Connect a client and subscribe to get total number of clients', function (t) {
  t.plan(1)
  var instance = aedes()
  var server = net.createServer(instance.handle)
  stats.wire(instance)

  server.listen(port)
  var subscriber

  subscriber = mqtt.connect({
    port: port,
    host: '127.0.0.1',
    clean: true,
    clientId: 'subscriber',
    keepalive: 200
  })

  subscriber.subscribe('$SYS/+/clients/total')

  subscriber.on('message', function (topic, message) {
    t.equal('1', message.toString(), 'clients connected')
    subscriber.end()
    instance.close()
    server.close()
  })
})

test('Connect a client and subscribe to get maximum number of clients', function (t) {
  t.plan(1)
  var instance = aedes()
  var server = net.createServer(instance.handle)
  stats.wire(instance)

  server.listen(port)
  var subscriber, additionalClient

  additionalClient = mqtt.connect({
    port: port,
    host: '127.0.0.1',
    clean: true,
    clientId: 'client',
    keepalive: 200
  })

  subscriber = mqtt.connect({
    port: port,
    host: '127.0.0.1',
    clean: true,
    clientId: 'subscriber',
    keepalive: 200
  })

  subscriber.subscribe('$SYS/+/clients/maximum')

  subscriber.on('message', function (topic, message) {
    t.equal('2', message.toString(), 'clients connected')
    subscriber.end()
    additionalClient.end()
    instance.close()
    server.close()
  })
})

test('Connect a client and subscribe to get current broker time', function (t) {
  t.plan(1)
  var instance = aedes()
  var server = net.createServer(instance.handle)
  stats.wire(instance)

  server.listen(port)
  var subscriber, additionalClient

  additionalClient = mqtt.connect({
    port: port,
    host: '127.0.0.1',
    clean: true,
    clientId: 'client',
    keepalive: 200
  })

  subscriber = mqtt.connect({
    port: port,
    host: '127.0.0.1',
    clean: true,
    clientId: 'subscriber',
    keepalive: 200
  })

  subscriber.subscribe('$SYS/+/time')

  subscriber.on('message', function (topic, message) {
    t.equal(instance.stats.started.toISOString(), message.toString(), 'current broker time')
    subscriber.end()
    additionalClient.end()
    instance.close()
    server.close()
  })
})

test('Connect a client and subscribe to get broker up-time', function (t) {
  t.plan(1)
  var instance = aedes()
  var server = net.createServer(instance.handle)
  stats.wire(instance)

  server.listen(port)
  var subscriber

  subscriber = mqtt.connect({
    port: port,
    host: '127.0.0.1',
    clean: true,
    clientId: 'subscriber',
    keepalive: 200
  })

  subscriber.subscribe('$SYS/+/uptime')

  subscriber.on('message', function (topic, message) {
    var moments = moment(instance.started)
    t.equal(moments.from(Date.now(), true).toString(), message.toString(), 'Broker uptime')
    subscriber.end()
    instance.close()
    server.close()
  })
})

test('Connect a client and subscribe to get the number of published messages', function (t) {
  t.plan(1)
  var instance = aedes()
  var server = net.createServer(instance.handle)
  stats.wire(instance)

  server.listen(port)
  var publisher

  publisher = mqtt.connect({
    port: port,
    host: '127.0.0.1',
    clean: true,
    clientId: 'client',
    keepalive: 200
  })

  publisher.subscribe('$SYS/+/messages/publish/sent', onSub)

  function onSub () {
    publisher.publish('publishing', 'hey there')
    publisher.publish('publishing', 'hey there')
  }

  publisher.on('message', function (topic, message) {
    t.equal('2', message.toString(), 'number of published messages')
    publisher.end()
    instance.close()
    server.close()
  })
})

test('Connect a client and and subscribe to get current heap usage', function (t) {
  t.plan(1)
  var instance = aedes()
  var server = net.createServer(instance.handle)
  stats.wire(instance)

  server.listen(port)
  var subscriber

  subscriber = mqtt.connect({
    port: port,
    host: '127.0.0.1',
    clean: true,
    clientId: 'subscriber',
    keepalive: 200
  })

  subscriber.subscribe('$SYS/+/memory/heap/current')

  subscriber.on('message', function (topic, message) {
    t.pass(message.toString(), 'bytes of heap used currently')
    subscriber.end()
    instance.close()
    server.close()
    t.end()
  })
})

test('Connect a client and and subscribe to get maximum heap usage', function (t) {
  t.plan(1)
  var instance = aedes()
  var server = net.createServer(instance.handle)
  stats.wire(instance)

  server.listen(port)
  var subscriber

  subscriber = mqtt.connect({
    port: port,
    host: '127.0.0.1',
    clean: true,
    clientId: 'subscriber',
    keepalive: 200
  })

  subscriber.subscribe('$SYS/+/memory/heap/maximum')

  subscriber.on('message', function (topic, message) {
    t.pass(message.toString(), 'max bytes of heap used till now')
    subscriber.end()
    instance.close()
    server.close()
    t.end()
    process.exit(0)
  })
})


