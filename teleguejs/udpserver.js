var dgram = require('dgram');

var localPort;

exports.start = function(port){
	localPort = port;
	server.bind(port);
}

exports.onData = null;

global.server = dgram.createSocket("udp4");

global.server.on("message", function (data, rinfo) {
	global.parseCommand(data);
});


console.log('*** UDP server module loaded');
