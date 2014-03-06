var net = require("net");
var WebSocketServer = require('ws').Server;
var wss;
var sockets = [];

exports.onConnect = null;
exports.onMessage = null;
exports.onClose = null;

exports.send = function(message){
	if (!sockets) return;

	for(var i=0, len = sockets.length; i < len; i++) { 
		if (!sockets[i]._socket.writable) continue;
		sockets[i].send(message);
	} 
}


exports.start = function(port){

	wss = new WebSocketServer({port: port});

	wss.on('connection', function(ws) {

		sockets.push(ws);

		if (exports.onConnect) exports.onConnect(ws);

		ws.on('message', function(message) {
			if (exports.onData) exports.onData(message);
		}); 

		ws.on('close', function(message) {
			
			if (exports.onEnd) exports.onEnd(message);

			console.log("*** connection closed");

			for(var i=0, l=sockets.length; i<l; i++) { 

				if(ws == sockets[i]) { 
					sockets.splice(i, 1); 
					console.log("*** client clear");
					break; 
				} 
			} 
		}); 

	});

}

console.log('*** Websockets server module loaded');
