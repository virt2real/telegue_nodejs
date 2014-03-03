/*
	TYPE - type of joystick

	= 0 - regular joystick
	= 1 - wheel and pedals
*/
var TYPE = 1;

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
				exports.motorshield.J1.setDirection (1, 1, 0);
			} else {
				exports.motorshield.J1.setDirection (1, 0, 1);
			}

			if (dir2) {
				exports.motorshield.J1.setDirection (2, 0, 1);
			} else {
				exports.motorshield.J1.setDirection (2, 1, 0);
			}

			if (!speed1){
				exports.motorshield.J1.setDirection (1, 1, 1);
			}

			if (!speed2){
				exports.motorshield.J1.setDirection (2, 1, 1);
			}


			exports.motorshield.J1.setSpeed(1, speed1);
			exports.motorshield.J1.setSpeed(2, speed2);

}
