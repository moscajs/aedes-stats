'use strict'

var os = require('os')

var startMeasure = cpuAverage()

function cpuAverage () {
  var totalIdle = 0
  var totalTick = 0
  var cpus = os.cpus()
  for (var i = 0, len = cpus.length; i < len; i++) {
    var cpu = cpus[i]
    for (var type in cpu.times) {
      totalTick += cpu.times[type]
    }
    totalIdle += cpu.times.idle
  }
  return {
    idle: totalIdle / cpus.length,
    total: totalTick / cpus.length
  }
}

function cpuCalculation () {
  var endMeasure = cpuAverage()
  var idleDifference = endMeasure.idle - startMeasure.idle
  var totalDifference = endMeasure.total - startMeasure.total
  var cpuPercentage = 100 - ~~(100 * idleDifference / totalDifference)
  return cpuPercentage
}

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
    time: new Date(),
    cpuUsage: 0
  }

  function doPub (topic, value) {
    aedesInstance.publish({
      topic: '$SYS/' + aedesInstance.id + '/' + topic,
      payload: '' + value,
      qos: 0,
      retain: true
    })
  }

  var timer = setInterval(iterate, options.interval || (1 * 1000))
  var cpuUsageTimer = setInterval(function () { aedesInstance.stats.cpuUsage = cpuCalculation() }, 1000)

  function iterate () {
    var stats = aedesInstance.stats
    stats.time = new Date()
    var uptime = Math.round((stats.time - stats.started) / 1000)
    var mem = process.memoryUsage()
    var cpu = os.loadavg()
    doPub('uptime', uptime)
    doPub('time', aedesInstance.stats.time.toISOString())
    doPub('clients/total', stats.connectedClients)
    doPub('clients/maximum', stats.maxConnectedClients)
    doPub('messages/publish/sent', stats.publishedMessages)
    doPub('memory/heap/current', mem.heapUsed)
    doPub('memory/heap/maximum', mem.heapTotal)
    doPub('cpu/usage', stats.cpuUsage)
    if (cpu && cpu.length >= 3) {
      // ref: http://nodejs.org/api/os.html#os_os_loadavg
      doPub('cpu/avg/last/1', cpu[0])
      doPub('cpu/avg/last/5', cpu[1])
      doPub('cpu/avg/last/15', cpu[2])
    }
  }

  aedesEvents.forEach(function (event) {
    aedesInstance.on(event.name, event)
  })

  aedesInstance.once('closed', function () {
    clearInterval(timer)
    clearInterval(cpuUsageTimer)
    aedesEvents.forEach(function (event) {
      aedesInstance.removeListener(event.name, event)
    })
  })
}

module.exports = wire
