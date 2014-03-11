/* turn off errors break */
process.on('uncaughtException', function (err) {
	console.log('Caught exception: ' + err);
});

/* device module */
var device = require("./device.js");

device.motor1 = 1;
device.motor2 = 2;
device.light = 8;
device.lightButton = 0xFFFFFF; // any button

// starting UDP server
var udpsocket = require('./udpserver.js');
udpsocket.start(1082);
udpsocket.onData = global.parseCommand;

/* make board object */
var virt2real = require("virt2real");
var board = new virt2real();

/* make motorshield object */
var motorshield = require("motorshield");
motorshield.setAddress(0x70);
motorshield.init();

device.motorshield = motorshield;

/* starting TCP server */
var tcpsocket = require('./tcpserver.js');
tcpsocket.start(1082);
tcpsocket.onConnect = ClientConnected;
tcpsocket.onEnd = ClientDisconnected;
tcpsocket.onError = ClientDisconnected;

/* starting Websockets server */
var wsserver = require('./wsserver.js');
wsserver.onConnect = onWsConnect;
wsserver.onData = global.parseWSCommand;
wsserver.start(1083);

/* video control module */
var video = require("./video.js");

/* check status module */
var status = require("./status.js");
status.send = tcpsocket.send;
status.wssend = wsserver.send;
status.motorshield = motorshield;
status.start(1000);


/* start connection alive timer */
var aliveTimer = setInterval(device.checkAlive, 500);

function ClientConnected(remoteHost, remotePort) {
	// now will start video stream on client's host (but not this port!)
	video.play(remoteHost);
}

function ClientDisconnected(remoteHost, remotePort) {
	// stop all motors
	device.StopAll;
	// now will stop video stream
	video.pause();
}

function onWsConnect(message) {
	console.log("*** Websocket client connected");
}
