var net = require("net");

var connectionStream;

exports.start = function(port){
	localPort = port;
	server.listen(port);
}

exports.onData = null;
exports.onConnect = null;
exports.onEnd = null;
exports.onError = null;
exports.send = function(message){

	if (connectionStream)	if (connectionStream.writable) {		connectionStream.write(message);
	}

}

global.server = net.createServer(function (stream) {

	connectionStream = stream;

	if (exports.onConnect) exports.onConnect(stream.remoteAddress, stream.remotePort);
	console.log("*** TCP client connected from " + stream.remoteAddress + ":" + stream.remotePort);

    stream.on("data", function (data) {

			//var buffer = new Buffer(data, "binary");
			//console.log(buffer);

    });

    stream.on("end", function () { 		console.log("*** TCP client disconnected from " + stream._peername.address + ":" + stream._peername.port);
		connectionStream = null;		

		if (exports.onEnd) exports.onEnd(stream._peername.address, stream._peername.port);
    });

    stream.on("error", function () {
		console.log("*** error TCP client connection/disconnection or receive data from " + stream._peername.address + ":" + stream._peername.port);
		if (exports.onError) exports.onError(stream._peername.address, stream._peername.port);
    });
});


console.log('*** TCP server module loaded');
