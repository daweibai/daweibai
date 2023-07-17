// v2: only the target ball in the same direction
// v3: with occluder at trial onset


const task_version    = 'v3_occlu';

const n_balls 	 = 30, // number of non-target balls. Has to be divisible by three
	n_each_color = n_balls/3,
	g   		 = 0.12,
	friction  	 = 1,
	r_ball 		 = 14,
	init_speed_limit = 3,
	cross_length = 15,
	cross_width  = 4,
	ball_color	 = "#2185C5",
	n_trials	 = 48,

	canvas_width = 600,
	canvas_height = 600,

	occlusion_interval = 1000;


var timeline = []

let stopID 
let t_stopper

var subjectId = 'dawei'

var colors = [
	// '#2185C5',
	// '#7FFF00',
	// '#BA55D3',
	// '#FF7F66'
	'black'
];





// Utility Functions
function randomIntFromRange(min,max) {
	return Math.random() * (max - min) + min;
}

function randomAngle() {
	return Math.floor(Math.random() * 4) * Math.PI /2;
}




// jspsych code
jsPsych.data.addProperties({task_version: task_version});


var trial = {       // each trial
	type:       'html-keyboard-response',     
	stimulus: 	'<canvas id="canvas2" style="z-index: 2; position:absolute; left:1px; top:0px;border: 2px solid black;"></canvas>'+ // canvas on top
				'<canvas id="canvas" style="z-index: 1; position:absolute; left:1px; top:0px;border: 2px solid black;"></canvas>',
	response_ends_trial: true,
	choices: ['space'],
	// post_trial_gap: 200,
	on_load: function() {    
		var canvas = document.getElementById('canvas');
		var c = canvas.getContext('2d');
		var canvas2 = document.getElementById('canvas2');
		var c2 = canvas2.getContext('2d');

		canvas.width = canvas_width;
		canvas.height = canvas_height;
		canvas2.width = canvas_width;
		canvas2.height = canvas_height;

		centerX = canvas.width/2,
		centerY = canvas.height/2

		
		function Ball(x, y, dx, dy, angle, radius, color, target) {
			this.x = x;
			this.y = y;
			this.dx = dx;
			this.dy = dy;
			this.angle 	= angle
			this.radius = radius;
			this.color = color;
			this.target = target;
			this.centerD = Math.sqrt(Math.pow(centerX - this.x, 2) + Math.pow(centerY - this.y, 2)) 
		
			this.update = function() {
				if ((this.y + this.radius + this.dy> canvas.height)||(this.y + this.dy<= 0 + this.radius)) {
					this.dy = -this.dy;
					this.dy = this.dy * friction;
					this.dx = this.dx * friction;
				} else if ((this.x + this.radius + this.dx>= canvas.width) || (this.x + this.dx <= 0 + this.radius)) {
					this.dx = -this.dx;
					this.dy = this.dy * friction;
					this.dx = this.dx * friction;
				} else {
					this.dx += g * Math.cos(this.angle);
					this.dy += g * Math.sin(this.angle);
				}
				
				this.x += this.dx;
				this.y += this.dy;
				this.draw();
			};
		
			this.draw = function() {
				c.beginPath();
				c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);	
				c.fillStyle = this.color;
				c.fill();
				c.stroke();
				c.closePath();
		

				// cross on the ball 
				// if not target, then draw cross
				if (this.target == false) {
					c.beginPath();
					c.rect(this.x - cross_width/2, this.y - cross_length/2, cross_width, cross_length );
					c.rect(this.x - cross_length/2, this.y - cross_width/2, cross_length, cross_width );
					c.fillStyle = 'white';
					c.fill();
				} else {
				// // if target, then draw T
					c.beginPath();
					c.rect(this.x - cross_width/2, this.y - cross_length/2 +2, cross_width, cross_length -2);
					c.rect(this.x - cross_length/2, this.y - cross_width/2 - 5, cross_length, cross_width );
					c.fillStyle = 'white';
					c.fill();
				}
		
			};
		}
		
		
		// Implementation
		var ballArray = [];
		
		function init() {
			var angle_set = [
				Math.PI /2,
				Math.PI,
				Math.PI * 3/2,
				Math.PI * 2,
			]

			ballArray = [];
			t0 = performance.now()

			var track_angle = randomAngle()
			index = angle_set.indexOf(track_angle); 
			angle_set.splice(index,1) // remove the target ball's direction from the angle set

			for (let i = 0; i < n_balls; i++) {
				var x = randomIntFromRange(r_ball * 2, canvas.width - r_ball * 2);
				var y = randomIntFromRange(r_ball * 2, canvas.height - r_ball * 2);
				var dx = randomIntFromRange(-init_speed_limit, init_speed_limit)
				var dy = randomIntFromRange(-init_speed_limit, init_speed_limit)
				// var angle  =  randomAngle()
				var n = Math.floor(i /n_each_color)
				var angle  =  angle_set[n]
				ballArray.push(new Ball(x, y, dx, dy, angle, r_ball, ball_color, false));
			}
		
			// the target ball
			var track_x = randomIntFromRange(r_ball * 2, canvas.width - r_ball * 2);
			var track_y = randomIntFromRange(r_ball * 2, canvas.height - r_ball * 2);
			var track_dx = randomIntFromRange(-init_speed_limit, init_speed_limit)
			var track_dy = randomIntFromRange(-init_speed_limit, init_speed_limit)

			ballArray.push(new Ball(track_x, track_y, track_dx, track_dy, track_angle, r_ball, ball_color, true));
			jsPsych.data.write({track_angle: track_angle, recording: 'angle'})
		
		}
		
		// Animation Loop
		function animate() {
			stopID = window.requestAnimationFrame(animate);


			c.clearRect(0, 0, canvas.width, canvas.height);
			
			for (let i = 0; i < ballArray.length; i++) {
				ballArray[i].update();
			}

			// draw occluder
			c2.beginPath();
			c2.rect(0,0, canvas.width, canvas.height);
			c2.fillStyle = 'white';
			c2.fill();
			
			t_stopper = performance.now()
			if (t_stopper - t0 > occlusion_interval) {
				c2.clearRect(0, 0, canvas.width, canvas.height);

			}		
			// fixation cross
			c2.beginPath();
			c2.rect(canvas.width/2 - 20, canvas.height/2-4, 40, 8);
			c2.rect(canvas.width/2 - 4, canvas.height/2 - 20, 8, 40);
			c2.fillStyle = 'black';
			c2.fill();
		}
		
		init();
		animate();
	},
	on_finish: function(data) {
		t1 = performance.now()
		rt = t1 - t0
		console.log(rt)
		cancelAnimationFrame(stopID)
		jsPsych.data.write({rt: rt, recording: 'rt'})
	}
}





for (i = 0; i < n_trials; i++){
	timeline.push(trial)
}

timeline.push({			// end recording data and save 
    type: 'call-function',
    func: saveDataWrap,
});

var debrief_block = {
    type: "html-keyboard-response",
    stimulus: "<p>Done!</p>",
    choices: jsPsych.NO_KEYS,
};

timeline.push(debrief_block);  						


jsPsych.init({      
	timeline: timeline,        
	// on_finish: function(){jsPsych.data.displayData();}
});