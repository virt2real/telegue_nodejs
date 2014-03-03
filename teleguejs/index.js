/* turn off errors break */
process.on('uncaughtException', function (err) {
	console.log('Caught exception: ' + err);
});

/* device module */
var device = require("./device.js");

// starting UDP server
var udpsocket = require('./udpserver.js');
udpsocket.start(1082);

/* make board object */
var virt2real = require("virt2real");
var board = new virt2real();

/* make motorshield object */
var motorshield = require("motorshield");
motorshield.setAddress(0x70);
motorshield.init();

device.motorshield = motorshield;

// starting TCP server
var tcpsocket = require('./tcpserver.js');
tcpsocket.start(1082);
tcpsocket.onConnect = ClientConnected;
tcpsocket.onEnd = ClientDisconnected;
tcpsocket.onError = ClientDisconnected;


/* check status module */
var status = require("./status.js");
status.send = tcpsocket.send;
status.motorshield = motorshield;
status.start(1000);


/* start connection alive timer */
var aliveTimer = setInterval(device.checkAlive, 500);



function ClientConnected(remoteHost, remotePort) {

	// now will start video stream on client's host (but not this port!)

	console.log("*** starting video stream to " + remoteHost);

	var exec = require('child_process').exec, child;

	var cmd = 'gst-client -p 0 set udpsink0 host string ' + remoteHost + ' && gst-client -p 0 play';
	child = exec(cmd, null);	

}

function ClientDisconnected(remoteHost, remotePort) {

	// stop all motors

	device.StopAll;

	// now will stop video stream

	console.log("*** pause video stream");

	var exec = require('child_process').exec, child;

	var cmd = 'gst-client -p 0 pause';
	child = exec(cmd, null);	

}

