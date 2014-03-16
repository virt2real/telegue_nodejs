/*
	TYPE - type of joystick

	= 0 - regular joystick
	= 1 - wheel and pedals
*/
var TYPE = 0;

/* maximum alive timeout */
var MAXTIMEOUT = 1000;

/* neutral position */
var NEUTRAL = 127;

/* maximal speed */
var MAXSPEED = 127;

/* external functions */
exports.motorshield = null;

/* local variables */
var oldAxeX, oldAxeY;
var aliveTimestamp = 0;

exports.motor1 = null;
exports.motor2 = null;
exports.light = null;

/* buttons */
exports.lightButton = null; // light toggle
exports.cameraUp = null; // camera tilt up
exports.cameraDown = null; // camera tilt down
exports.cameraLeft = null; // camera pan left
exports.cameraRight = null; // camera pan right


exports.SetLight = SetLight;

/* check alive timer */
exports.checkAlive = function() {

	if (!aliveTimestamp) return;

	var d = new Date();
	currentTime = d.getTime();

	if ((currentTime - aliveTimestamp) > MAXTIMEOUT) {
		/* alive timeout */
		aliveTimestamp = 0;

		/* stop motors */
		exports.StopAll();
	}
}


/* process recieved commands */
global.parseCommand = function(data) {

	var buffer = new Buffer(data, "binary");

	switch (buffer[0]) {

		case 0:
				// alive command
				var d = new Date();
				aliveTimestamp = d.getTime();

		break;

		case 1:
				// move tracks command

				/* parse axe values */

				var axeX;
				var axeY;

				var buttons = buffer[5] | (buffer[6] << 8) | (buffer[7] << 16);
				ParseButtons(buttons);

				if (!TYPE) {
					/* regular joystick */
					axeX = buffer[1];
					axeY = buffer[2];
				} else {

					/* wheel and pedals */
					axeX = buffer[1];

					/* calculate brake pedal */
					axeY = NEUTRAL +  ((255 - buffer[4]) >> 1);

					/* calculate acelerate pedal */
					axeY = axeY - ((255 - buffer[2]) >> 1);

				}

				if ((axeX == oldAxeX) && (axeY == oldAxeY)) return;
				oldAxeX = axeX;
				oldAxeY = axeY;

				MoveTracks(axeX, axeY);

		break;

	}


}


global.parseWSCommand = function(message) {

	var json
	try {
		json = JSON.parse(message);
	} catch (err) {
		return;
	}

	switch (json.cmd) {	

		case "alive":
			// alive command
			var d = new Date();
			aliveTimestamp = d.getTime();
		break;

		case "drive":
			// move command
			MoveTracksAbs (json.v1, json.v2);
		break;

		case "adrive":
			// move command analogue
			MoveTracks (json.v1, json.v2);
		break;

		case "pantilt":
			// move camera pan and tilt
			PanTilt(json.v1, json.v2);
		break;

		case "cam":
			// move camera pan and tilt on fixed step
			if (json.v1 == 0)
				exports.motorshield.J17.setPos(1, exports.motorshield.J17.getPos(1) + 10);
			if (json.v1 == 1)
				exports.motorshield.J17.setPos(1, exports.motorshield.J17.getPos(1) - 10);
			if (json.v1 == 2)
				exports.motorshield.J17.setPos(2, exports.motorshield.J17.getPos(1) + 10);
			if (json.v1 == 3)
				exports.motorshield.J17.setPos(2, exports.motorshield.J17.getPos(1) - 10);
		break;			


		case "light":
			// toggle or turn on/off lights
			SetLight(json.v1);
		break;
	}

}



/* stop all motors */
exports.StopAll = function () {
	console.log("*** Stop All motors!");
	MoveTracks(NEUTRAL, NEUTRAL);
}


/* 
move tracks 
	val1 - axeX value
	val2 - axeY value
*/
function MoveTracks (val1, val2){

            var dx = NEUTRAL - val1;
            var dy = NEUTRAL - val2;

            var speed1 = 0;
            var speed2 = 0;
            var dir1 = 0;
            var dir2 = 0;

			if (val2 > MAXSPEED){
				speed1 = dy - dx;
				speed2 = dy + dx;
			} else
			if (val2 < MAXSPEED){
				speed1 = dy - dx;
				speed2 = dy + dx;
			}

			if (speed1 >= 0)
				dir1 = 1;
			else
			if (speed1 < 0)
				dir1 = 0;

			if (speed2 >= 0)
				dir2 = 1;
			else
			if (speed2 < 0)
				dir2 = 0;

			if (speed1 > MAXSPEED) speed1 = MAXSPEED;
			if (speed2 > MAXSPEED) speed2 = MAXSPEED;

			speed1 = parseInt(Math.abs(speed1) *  100 / MAXSPEED);
			speed2 = parseInt(Math.abs(speed2) *  100 / MAXSPEED);

			if (dir1) {
				exports.motorshield.J1.setDirection (exports.motor1, 1, 0);
			} else {
				exports.motorshield.J1.setDirection (exports.motor1, 0, 1);
			}

			if (dir2) {
				exports.motorshield.J1.setDirection (exports.motor2, 0, 1);
			} else {
				exports.motorshield.J1.setDirection (exports.motor2, 1, 0);
			}

			if (!speed1){
				exports.motorshield.J1.setDirection (exports.motor1, 1, 1);
			}

			if (!speed2){
				exports.motorshield.J1.setDirection (exports.motor2, 1, 1);
			}


			exports.motorshield.J1.setSpeed(exports.motor1, speed1);
			exports.motorshield.J1.setSpeed(exports.motor2, speed2);

}


/* 
move tracks absolute values
	speed1 - speed1
	speed2 - speed2
*/
function MoveTracksAbs (speed1, speed2){

            var dir1 = 0;
            var dir2 = 0;

			if (speed1 >= NEUTRAL )
				dir1 = 1;
			else
			if (speed1 < NEUTRAL)
				dir1 = 0;

			if (speed2 >= NEUTRAL)
				dir2 = 1;
			else
			if (speed2 < NEUTRAL)
				dir2 = 0;

			speed1 = parseInt(Math.abs(speed1 - NEUTRAL) *  100 / MAXSPEED);
			speed2 = parseInt(Math.abs(speed2 - NEUTRAL) *  100 / MAXSPEED);

			if (dir1) {
				exports.motorshield.J1.setDirection (exports.motor1, 1, 0);
			} else {
				exports.motorshield.J1.setDirection (exports.motor1, 0, 1);
			}

			if (dir2) {
				exports.motorshield.J1.setDirection (exports.motor2, 0, 1);
			} else {
				exports.motorshield.J1.setDirection (exports.motor2, 1, 0);
			}

			if (!speed1){
				exports.motorshield.J1.setDirection (exports.motor1, 1, 1);
			}

			if (!speed2){
				exports.motorshield.J1.setDirection (exports.motor2, 1, 1);
			}

			exports.motorshield.J1.setSpeed(exports.motor1, speed1);
			exports.motorshield.J1.setSpeed(exports.motor2, speed2);
}


function ParseButtons (value) {

	if (value & exports.cameraDown) {
		exports.motorshield.J17.setPos(1, exports.motorshield.J17.getPos(1) + 10);
	}
	if (value & exports.cameraUp) {
		exports.motorshield.J17.setPos(1, exports.motorshield.J17.getPos(1) - 10);
	}

	if (value & exports.lightButton)
		SetLight(0);

}


function SetLight (value) {

	switch (value) {
		case 0:
			// toggle
			var current = exports.motorshield.J16.getSpeed(exports.light);
			exports.motorshield.J16.setSpeed(exports.light, (current > 0) ? 0 : 255);
		break;
		case 1:
			// turn on
			exports.motorshield.J16.setSpeed(exports.light, 100);
		break;
		case 2:
			// turn off
			exports.motorshield.J16.setSpeed(exports.light, 0);
		break;
	}
}


function PanTilt(value1, value2) {
	exports.motorshield.J17.setPos(1, value2);
	exports.motorshield.J17.setPos(2, value1);
}
