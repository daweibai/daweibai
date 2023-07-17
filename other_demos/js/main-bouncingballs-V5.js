// v5: with 16 balls total
// by dawei 20/12/2020
let skip_instructions = false ;
let skip_training 	= false ;


const task_version    = 'v5_16balls';

const n_each_direction = 5,
	n_balls 	 = n_each_direction * 3, 
	g   		 = 0.12,
	r_ball 		 = 14,
	init_speed_limit = 3,
	cross_length = 15,
	cross_width  = 4,
	ball_color	 = "#2185C5",
	pi 			 = Math.PI,

	n_training	 = 9,
	n_trials	 = 60,

	canvas_width = 600,
	canvas_height = 600,

	mask_interval = 1200;



let stopID 
let t_stopper, t1, t0

	

// Utility Functions
function randomIntFromRange(min,max) {
	return Math.random() * (max - min) + min;
}

function randomAngle() {
	return Math.floor(Math.random() * 4) * Math.PI /2;
}



// jsPsych save global info
let subjectId = jsPsych.randomization.randomID(8);		// ID
jsPsych.data.addProperties({subject: subjectId, task_version: task_version});

// resize canvas
function resize() {
	canvas.width = canvas_width;
	canvas.height = canvas_height;
	canvas2.width = canvas_width;
	canvas2.height = canvas_height;
}

// end trial if space pressed
function endTrial(e) {  
	// console.log(e)
	if  (e.keyCode == '32') {
		document.removeEventListener('keypress', endTrial)
        cancelAnimationFrame(stopID)        //stop requestAnimationFrame
		
        // save data
		t1 = performance.now()
		rt = t1 - t0 - mask_interval
		// console.log(rt)
		jsPsych.data.write({rt: rt, recording: 'rt'})    

        jsPsych.finishTrial()
	}
}

display = function() {    
		
	var canvas  = document.getElementById('canvas');
	var c 		= canvas.getContext('2d');
	var canvas2 = document.getElementById('canvas2');
	var c2 		= canvas2.getContext('2d');

	resize()

	function Ball(x, y, dx, dy, angle, radius, color, target) {
		this.x = x;
		this.y = y;
		this.dx = dx;
		this.dy = dy;
		this.angle 	= angle
		this.radius = radius;
		this.color = color;
		this.target = target;
	
		this.update = function() {
			if ((this.y + this.radius + this.dy> canvas.height)||(this.y + this.dy<= 0 + this.radius)) {
				this.dy = -this.dy;

			} else if ((this.x + this.radius + this.dx>= canvas.width) || (this.x + this.dx <= 0 + this.radius)) {
				this.dx = -this.dx;

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
			c.arc(this.x, this.y, this.radius, 0, pi * 2, false);	
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
	
	var ballArray = [];
	
	function init() {
		var angle_set = [
			pi /2,
			pi,
			pi * 3/2,
			pi * 2,
		]

		ballArray = [];
		t0 = performance.now()

		var track_angle = randomAngle()
		index = angle_set.indexOf(track_angle); 
		angle_set.splice(index,1) // remove the target ball's direction from the angle set

		// non-target balls
		for (let i = 0; i < n_balls; i++) {
			var x = randomIntFromRange(r_ball * 2, canvas.width - r_ball * 2);
			var y = randomIntFromRange(r_ball * 2, canvas.height - r_ball * 2);
			var dx = randomIntFromRange(-init_speed_limit, init_speed_limit)
			var dy = randomIntFromRange(-init_speed_limit, init_speed_limit)

			var n = Math.floor(i /n_each_direction)
			var angle  =  angle_set[n]
			ballArray.push(new Ball(x, y, dx, dy, angle, r_ball, ball_color, false));
		}
	
		// target ball
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

		// draw mask
		c2.beginPath();
		c2.rect(0,0, canvas.width, canvas.height);
		c2.fillStyle = 'white';
		c2.fill();

		// fixation cross
		c2.beginPath();
		c2.rect(canvas.width/2 - 20, canvas.height/2-4, 40, 8);
		c2.rect(canvas.width/2 - 4, canvas.height/2 - 20, 8, 40);
		c2.fillStyle = 'black';
		c2.fill();

		t_stopper = performance.now()

		if (t_stopper - t0 > mask_interval) { // remove mask
			c2.clearRect(0, 0, canvas.width, canvas.height);
			document.addEventListener('keypress', endTrial);
		}		
	}
	
	init();
	animate();
}



var training_trial = {       
	type:       'html-keyboard-response',     
	stimulus: 	'<canvas id="canvas2"></canvas>'+ // canvas on top
				'<canvas id="canvas"></canvas>',
	data: {test_part: 'training'},			
	response_ends_trial: true,
	choices: jsPsych.NO_KEYS,
	on_load: display,
}


var test_trial = {       
	type:       'html-keyboard-response',     
	stimulus: 	'<canvas id="canvas2"></canvas>'+ // canvas on top
				'<canvas id="canvas"></canvas>',
	data: {test_part: 'test'},			
	response_ends_trial: true,
	choices: jsPsych.NO_KEYS,
	on_load: display,
}





//-------------------------------------------------------------------------
// Instructions and stuff
//-------------------------------------------------------------------------
var is_mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)  // true for mobile device
var mobile_warning = {
    data: {
        test_part: 'browser-check'
    },
    type: 'html-button-response',
    button_html: '<button class="jspsych-btn" style="width: 300px;">%choice%</button><br><br><br>',
    stimulus: '<p><strong>It seems you are using a mobile phone - this experiment will not work properly.</strong></p><p>Please try using a computer.</p>',
    choices: ['<strong>Exit<br>experiment</strong>'],
    on_finish: function (data){
        if (data.button_pressed == 0)
	    jsPsych.endExperiment('Experiment aborted.');
    },
};

var is_firefox = typeof InstallTrigger !== 'undefined';
var browser_warning = {
    data: {
        test_part: 'browser-check'
    },
    type: 'html-keyboard-response',
	stimulus: '<p>It seems you are using Firefox - this experiment will not work properly. Please use Chrome.</p>',
    choices: jsPsych.NO_KEYS,

};

// instructions
var instructions_1 = {
    type: "html-keyboard-response",
    data: {test_part: 'instructions'},
	stimulus: 
		"<h1>Instructions</h1>" + 
		"<p>In this Nobel Prize winning experiment, your will see scenes of moving balls.</p>" + 
		"<p>There are two types of balls: <img src= 'figures/plus_ball.jpg' style='width:20px'> and <img src= 'figures/T_ball.jpg' style='width:20px'>.</p>" + 
		"<p>There is always only one <img src= 'figures/T_ball.jpg' style='width:20px'> in the scene. <strong>Your job is to simply find it</strong>.</p>"+
        "<img src= 'figures/figure_scene_16balls.jpg' style='width:500px'> "+
		"<p><strong>If you find the <img src= 'figures/T_ball.jpg' style='width:20px'>, press 'space' on your keyboard</strong>.</p>"+
		"<p>We are interested in how fast you can find the <img src= 'figures/T_ball.jpg' style='width:20px'>, so please try to find it and respond <strong>as quickly as possible</strong>!</p>"+
		"<p>You will now go through a few training trials. Please press 'space' to continue.</p>" ,
    choices: ['space']
};

var instructions_2 = {
    type: "html-keyboard-response",
    data: {test_part: 'instructions'},
    stimulus: 
		"<p>Good job! Now you know how it works. The real trials start in the next screen.</p>" + 
		"<p>Please stay focused throughout the trials, which will only take about 3 minutes.</p>" + 
		"<p></p>" + 
		"<p>Press 'space' to start the test.</p>",    
		choices: ['space']
};


// feedback
var feedback = {
    type: "html-button-response",
    data: {test_part: 'feedback'},
	stimulus: 
		"<p>Well done! One last question: </p>"+
		"<p>Are the videos displayed smoothly?</p>",
	choices: ['Yes', 'No', 'Yes in the beginning, but they stutter towards the end', 'Yes overall, but they stutter occasionally']
};

var debrief_block = {
    type: "html-keyboard-response",
    stimulus: "<p>All done! Thank you for your participation! You will be thanked in my Nobel Prize acceptance speech!</p>",
    choices: jsPsych.NO_KEYS
};




//-------------------------------------------------------------------------
// Timeline
//-------------------------------------------------------------------------
var timeline = []

if (is_mobile){
    timeline.push(mobile_warning);
}	

if (is_firefox){ 
    timeline.push(browser_warning);
}	

if (!skip_instructions){
	timeline.push(instructions_1)       
}	


if (!skip_training){
	for (i = 0; i < n_training; i++){
		timeline.push(training_trial)
	}
}
if (!skip_instructions){
    timeline.push(instructions_2)       
}	

for (i = 0; i < n_trials; i++){
	timeline.push(test_trial)
}

timeline.push(feedback);  						


/* save some final subject-level data */
timeline.push({
    type: 'call-function',
    func: function() {},
    on_finish: function(data){
        data.test_part = 'interaction_data';
        data.user_agent = navigator.userAgent;
        data.interaction_data = jsPsych.data.getInteractionData().json(); // long string, so save only once
        data.browser = navigator.sayswho= (function(){   // detect browser
            var ua= navigator.userAgent, tem,
            M= ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
            if(/trident/i.test(M[1])){
                tem=  /\brv[ :]+(\d+)/g.exec(ua) || [];
                return 'IE '+(tem[1] || '');
            }
            if(M[1]=== 'Chrome'){
                tem= ua.match(/\b(OPR|Edge?)\/(\d+)/);
                if(tem!= null) return tem.slice(1).join(' ').replace('OPR', 'Opera').replace('Edg ', 'Edge ');            
            }
            M= M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
            if((tem= ua.match(/version\/(\d+)/i))!= null) M.splice(1, 1, tem[1]);
            return M.join(' ');
        })();
    }
});



timeline.push({			// end recording data and save 
    type: 'call-function',
    func: saveDataWrap,
});

timeline.push(debrief_block);  						

jsPsych.init({      
	timeline: timeline,        
	// on_finish: function(){jsPsych.data.displayData();}
});