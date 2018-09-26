'use strict'

function client () {
  this.stats.connectedClients++
  if (this.stats.connectedClients > this.stats.maxConnectedClients) {
    this.stats.maxConnectedClients = this.stats.connectedClients
  }
}

function clientDisconnect () {
  this.stats.connectedClients--
}

function publish (packet) {
  if (packet && packet.topic.indexOf('$SYS') < 0) {
    this.stats.publishedMessages++
  }
}

var aedesEvents = [
  client,
  clientDisconnect,
  publish
]

function wire (aedesInstance, options) {
  if (!aedesInstance) {
    throw new Error('Need to pass an instance of aedes to enable stats')
  }

  options = options || {}

  aedesInstance.stats = {
    maxConnectedClients: 0,
    connectedClients: 0,
    publishedMessages: 0,
    started: new Date(),
    time: new Date()
  }

  function doPub (topic, value) {
    aedesInstance.publish({ topic: '$SYS/' + aedesInstance.id + '/' + topic, payload: '' + value })
  }

  var timer = setInterval(iterate, options.interval || (1 * 1000))

  function iterate () {
    var stats = aedesInstance.stats
    stats.time = new Date()
    var uptime = Math.round((stats.time - stats.started) / 1000)
    var mem = process.memoryUsage()
    doPub('uptime', uptime)
    doPub('time', aedesInstance.stats.time.toISOString())
    doPub('clients/total', stats.connectedClients)
    doPub('clients/maximum', stats.maxConnectedClients)
    doPub('messages/publish/sent', stats.publishedMessages)
    doPub('memory/heap/current', mem.heapUsed)
    doPub('memory/heap/maximum', mem.heapTotal)
  }

  aedesEvents.forEach(function (event) {
    aedesInstance.on(event.name, event)
  })

  aedesInstance.once('closed', function () {
    clearInterval(timer)
    aedesEvents.forEach(function (event) {
      aedesInstance.removeListener(event.name, event)
    })
  })
}

module.exports = wire
