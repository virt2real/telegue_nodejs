/* update status timer */
var statusTimer;

var ifaceName = "wlan0";

var wlanStatus = {
	level: 0,
	link: 0
}

/* function for send info via TCP socket */
exports.send = null;

/* function for send info via websocket */
exports.wssend = null;

exports.motorshield = null;

exports.start = function(timeout){

	statusTimer = setInterval(SendStatus, timeout);
	checkWlan();

}

/* check wlan connection status */
function checkWlan() {
	fs.readFile('/proc/net/wireless', function (err, data) {
		if (err) return;

		var str = "" + data;
		var messages = str.split("\n");
		for (var i in messages){

			var strings = messages[i].split(" ");
			if (strings[1] == ifaceName + ":") {
				wlanStatus.link = strings[5].replace(".", "");
				wlanStatus.level = strings[7].replace(".", "");
			}
		}

		wlanTimer = setTimeout(checkWlan, 3000);
	});
}

/* send status info to client */
function SendStatus() {
	var status = new Object();
	status.cmd = "st";
	status.vol = exports.motorshield.getVoltage(); // battery voltage
	status.lnk = wlanStatus.link; // wi-fi signal
	status.lev = wlanStatus.level; // wi-fi dBm

	if (exports.send) 
		exports.send(JSON.stringify(status)); // send info via TCP

	if (exports.wssend) 
		exports.wssend(JSON.stringify(status)); // send info via Websockets

}

console.log('*** status module loaded');
