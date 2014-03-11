/* function for play video */
exports.play = function(host){

	console.log("*** play video stream to " + host);
	var exec = require('child_process').exec, child;
	var cmd = 'gst-client -p 0 set udpsink0 host string ' + host + ' && gst-client -p 0 play';
	child = exec(cmd, null);	

}

/* function for pause video */
exports.pause = function(){
	console.log("*** pause video stream");
	var exec = require('child_process').exec, child;
	var cmd = 'gst-client -p 0 pause';
	child = exec(cmd, null);	
}

console.log('*** video module loaded');
