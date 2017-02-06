"use strict"

var moment = require("moment")

function Stats(){
if(!(this instanceof Stats)){
	return new Stats()
}

this.maxConnectedClients = 0
this.connectedClients = 0
this.publishedMessages = 0
this.started = new Date()

}


function client(){
	this.stats.connectedClients++
	if(this.stats.connectedClients > this.stats.maxConnectedClients){
		this.stats.maxConnectedClients = this.stats.connectedClients
	}
}

function clientDisconnect(){
	this.stats.connectedClients--
}

function publish(packet){
	if(packet && packet.topic.indexOf('$SYS') < 0){
		this.stats.publishedMessages++
	}
}

var aedesEvents = [
    client,
    clientDisconnect,
    publish
];

Stats.prototype.wire = function(aedesInstance){
	aedesInstance.stats = this
	
	function doPub(topic,value){
		aedesInstance.publish({
			topic : "$SYS/"+ aedesInstance.id + "/" + topic,
			payload : "" + value
		})
	}

	var moments = moment(this.started) 

	var timer = setInterval(function(){
	  var stats = aedesInstance.stats
	  var mem = process.memoryUsage()
	  var date = new Date()

	  doPub('uptime',moments.from(Date.now(),true))
	  doPub('time',aedesInstance.stats.started.toISOString())
	  doPub('clients/total',stats.connectedClients)
	  doPub('clients/maximum',stats.maxConnectedClients)
	  doPub('messages/publish/sent', stats.publishedMessages)
	  doPub("memory/heap/current", mem.heapUsed)
	  doPub("memory/heap/maximum", mem.heapTotal)
	},10*1000)


	aedesEvents.forEach(function(event){
		aedesInstance.on(event.name,event)
	})

	aedesInstance.once("closed",function(){
			clearInterval(timer)
			aedesEvents.forEach(function(event){
		    aedesInstance.removeListener(event.name,event)
	    })
	})
}

module.exports = Stats

