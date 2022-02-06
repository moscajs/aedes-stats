'use strict'

const { test } = require('tap')
const mqtt = require('mqtt')
const aedes = require('aedes')
const stats = require('./stats')
const net = require('net')
const QlobberTrue = require('qlobber').QlobberTrue
const matcher = new QlobberTrue({ wildcard_one: '+', wildcard_some: '#' })
const port = 1889
let clients = 0
let server

function setup () {
  const instance = aedes()
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
  const client = mqtt.connect({
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
  const bool = matcher.match(expected, actual)
  matcher.clear()
  return bool
}

test('Connect a client and subscribe to get total number of clients', function (t) {
  t.plan(2)

  const sysTopic = '$SYS/+/clients/total'
  const subscriber = connect(setup())

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

  const sysTopic = '$SYS/+/clients/maximum'
  const s = setup()
  const subscriber = connect(s, { clientId: 'subscriber' })
  const additionalClient = connect(s, { clientId: 'client' })

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

  const sysTopic = '$SYS/+/time'
  const s = setup()
  const subscriber = connect(s, { clientId: 'subscriber' })
  const additionalClient = connect(s, { clientId: 'client' })

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

  const sysTopic = '$SYS/+/uptime'
  const s = setup()
  const subscriber = connect(s)

  subscriber.subscribe(sysTopic)

  subscriber.on('message', function (topic, message) {
    t.ok(checkTopic(topic, sysTopic))
    const seconds = Math.round((s.instance.stats.time - s.instance.stats.started) / 1000)
    t.equal(seconds.toString(), message.toString(), 'Broker uptime')
    subscriber.end()
    t.end()
  })
})

test('Connect a client and subscribe to get the number of published messages', function (t) {
  t.plan(2)

  const sysTopic = '$SYS/+/messages/publish/sent'
  const publisher = connect(setup())

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

  const sysTopic = '$SYS/+/memory/heap/current'
  const subscriber = connect(setup())

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

  const sysTopic = '$SYS/+/memory/heap/maximum'
  const subscriber = connect(setup())

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

  const sysTopic = '$SYS/+/cpu/usage'
  const subscriber = connect(setup())

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

  const sysTopic = '$SYS/+/cpu/avg/last/1'
  const subscriber = connect(setup())

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

  const sysTopic = '$SYS/+/cpu/avg/last/5'
  const subscriber = connect(setup())

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

  const sysTopic = '$SYS/+/cpu/avg/last/15'
  const subscriber = connect(setup())

  subscriber.subscribe(sysTopic)

  subscriber.on('message', function (topic, message) {
    t.ok(checkTopic(topic, sysTopic))
    t.pass(message.toString(), 'cpu avg of last 15 min')
    subscriber.end()
    t.end()
  })
})
