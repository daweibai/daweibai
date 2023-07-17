// Pilot 1 Recruiting Prolific participants
// with trials without target
// by dawei 02/01/2020

let skipWelcome 	 = true ;
let skipInstructions = true ;
let skipTraining 	 = false ;
let skipAttention 	 = false ;


const task_version    = 'Pilot 1 (Prolific)';

const n_each_direction = 5,
	n_balls 	 = n_each_direction * 3, 
	g   		 = 0.12,
	r_ball 		 = 14,
	init_speed_limit = 3,
	cross_length = 15,
	cross_width  = 4,
	ball_color	 = "#2185C5",
	pi 			 = Math.PI,

	n_training	 = 10,
	n_trials	 = 65,
	nTrialEachCondition = n_trials/5

	canvas_width = 600,
	canvas_height = 600,

	mask_interval = 1200;



let stopID 
let t_stopper, t1, t0

let ballTooCloseToCenter
let isTraining
const centerRange  = 100
	
var conditionArray = [
	pi /2,
	pi,
	pi * 3/2,
	pi * 2,
	'absent',
]

var trainArrayShuffled 	   = jsPsych.randomization.repeat(conditionArray, 2);
var conditionArrayShuffled = jsPsych.randomization.repeat(conditionArray, nTrialEachCondition);


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
	if  (e.keyCode == '32') { //if press 'space'

		document.removeEventListener('keydown', endTrial)
		cancelAnimationFrame(stopID)        
		
		correct = correctKey == e.keyCode // determine accuracy
		
        // save data
		t1 = performance.now()
		rt = t1 - t0 - mask_interval
		jsPsych.data.write({rt: rt, track_angle: track_angle, targetPressedX : targetPressedX, targetPressedY: targetPressedY, trial: trialCounter, keyPressed: e.keyCode, correct_key: correctKey, correct: correct})    

        jsPsych.finishTrial()
	} else if (e.keyCode == '78') { // if press 'n'
		document.removeEventListener('keydown', endTrial)
		cancelAnimationFrame(stopID)        
		
		correct = correctKey == e.keyCode
		
		// save data
		t1 = performance.now()
		rt = t1 - t0 - mask_interval
		jsPsych.data.write({rt: rt, track_angle: track_angle, targetPressedX : targetPressedX, targetPressedY: targetPressedY, trial: trialCounter, keyPressed: e.keyCode, correct_key: correctKey, correct: correct})    

		jsPsych.finishTrial()

	}
}

var targetPressedX // target position when 'space' is pressed
var targetPressedY

var correctKey
var correct
var track_angle 

var trialCounter = 0

display = function() {    

	
	trialCounter = trialCounter + 1

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

				targetPressedX = this.x
				targetPressedY = this.y
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

		if (isTraining) {
			track_angle = trainArrayShuffled[trialCounter-1]
		} else {
			track_angle = conditionArrayShuffled[trialCounter-1]
		} 
		
		if (track_angle== "absent") {
			correctKey = "78" 
		} else {
			correctKey = "32" 
		}



		if (track_angle == "absent") {  // if the target ball is absent
			var track_angle_invis = randomAngle()
		
			index = angle_set.indexOf(track_angle_invis); 
			angle_set.splice(index,1) // remove a random direction from the angle set

		} else {
			index = angle_set.indexOf(track_angle); 
			angle_set.splice(index,1) // remove the target ball's direction from the angle set

			// target ball
			var track_x = randomIntFromRange(r_ball * 2, canvas.width - r_ball * 2);
			var track_y = randomIntFromRange(r_ball * 2, canvas.height - r_ball * 2);
			var track_dx = randomIntFromRange(-init_speed_limit, init_speed_limit)
			var track_dy = randomIntFromRange(-init_speed_limit, init_speed_limit)
		
			ballTooCloseToCenter = Math.sqrt((track_x - canvas_width/2) **2 + (track_y - canvas_height/2) **2) <= centerRange
			while (ballTooCloseToCenter) {
				track_x = randomIntFromRange(r_ball * 2, canvas.width - r_ball * 2);
				track_y = randomIntFromRange(r_ball * 2, canvas.height - r_ball * 2);
				ballTooCloseToCenter = Math.sqrt((track_x - canvas_width/2) **2 + (track_y - canvas_height/2) **2) <= centerRange
			}
		}

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

		ballArray.push(new Ball(track_x, track_y, track_dx, track_dy, track_angle, r_ball, ball_color, true));
		// jsPsych.data.write({track_angle: track_angle, recording: 'angle', correct_key: correctKey, trial: trialCounter})
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
		c2.rect(canvas.width/2 - 20, canvas.height/2 - 4, 40, 8);
		c2.rect(canvas.width/2 - 4,  canvas.height/2 - 20, 8, 40);
		c2.fillStyle = 'black';
		c2.fill();

		t_stopper = performance.now()

		if (t_stopper - t0 > mask_interval) { // remove mask
			c2.clearRect(0, 0, canvas.width, canvas.height);
			document.addEventListener('keydown', endTrial);
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
	choices: jsPsych.NO_KEYS,
	on_load: function() {
		isTraining = true 
		display()
	},
}


var test_trial = {       
	type:       'html-keyboard-response',     
	stimulus: 	'<canvas id="canvas2"></canvas>'+ // canvas on top
				'<canvas id="canvas"></canvas>',
	data: {test_part: 'test'},			
	choices: jsPsych.NO_KEYS,
	on_load: function() {
		isTraining = false 
		display()
	},
}

var showCorrect = {
    type: "html-keyboard-response",
	stimulus: "",
	data: {test_part: 'showCorrect'},
	choices: jsPsych.NO_KEYS,
	trial_duration: 1000,
	prompt: function() {
		var lastTrial = jsPsych.data.get().last(2).values()[0]
		console.log(lastTrial.track_angle)
		if (lastTrial.correct) {
			if (lastTrial.rt > 3000) {
				return "<h3>Correct, but try to be faster!</h3>"
			} else {
				return "<h3>Correct!</h3>"
			}
		} else {
			return "<h3>Incorrect!</h3>"
		}
	}
};



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

var instr_continue = {
    data: {test_part: 'instructions'},
    type: "html-keyboard-response",
    stimulus: function(){
	return jsPsych.data.get().last(1).values()[0].stimulus;
    },
    choices: ['space'],
    prompt: 'Press space to continue when done reading.',
    post_trial_gap: 100,
}

var continue_msg 				= '(option to continue will appear after a short delay)';

var welcome = {
	type: "html-keyboard-response",
	stimulus: "Welcome to the experiment. Press any key to begin."
  };

var consentform = {
  type: "html-keyboard-response",
  stimulus: 
	  "<p>Please read the following agreement to participate.</p>"+
	  "<h3>Description of the study:</h3>"+
	  "<p>The purpose of the study is to understand visual perception.</p>"+
	  "<h3>Risks, Benefits, and Confidentiality: </h3>"+
	  "<p id = 'text'>There are no known risks. You will receive a compensation, as is indicated on Prolific. "+ 
	  "All of your responses will be held anonymously. Only the researchers involved in this study and "+
	  "those responsible for research oversight will have access to the information you provide. "+ 
	  "Your data and information will be completely confidential.</p>"+
	  "<h3>Time Commitment: </h3>"+
	  "<p>The study will take about 5 minutes. </p>"+
	  "<h3>Voluntary Participation: </h3>"+
	  "<p>Participation in this study is completely voluntary.</p>"+
	  "<h3>Contact Information: </h3>"+
	  "<p>If you have any questions or concerns about any aspect of the study, please feel free to </p>"+
	  "<p>contact dawei.bai@ens.fr.</p>"+
	  "<br>"+
	  "<p>If you agree with this consent form, press 'space'.</p>",
  choices: ['space'],	
  post_trial_gap: 100
};

var getReadyMessage = {
    data: {test_part: 'instructions'},
    type: "html-keyboard-response",
    stimulus: '<h1>Let&#39;s get ready...</h1>&nbsp;'+
		'<br>When the experiment begins, you will sometimes need to answer quickly by pressing a key on your keyboard.<br>'+
		'<br>Things you need to do to make sure everything works fine:<ul> '+
		'<li>Maximize your browser window and make sure you can comfortably watch the screen and use the keyboard.</li>' +
		'<li>Close any performance demanding program, so your computer works fast enough.</li>' +
		'<li>Close any chat programs or phone, so as not to be interrupted.</li> '+
		'<li><strong>Be prepared to remain equally attentive and alert for the duration of the experiment</strong>:'+
		'<br>your data will only be useful to us if you stay focused throughout the entire study. It&#39;s quite short, so there is no need to take a break before the end.<br></li></ul>&nbsp;<div style="text-align: center;">',
	choices: jsPsych.NO_KEYS,
	trial_duration: 5000,
	prompt: continue_msg,
};

// instructions
var instructions_1 = {
    type: "html-keyboard-response",
    data: {test_part: 'instructions'},
	stimulus: 
		"<h1>Instructions</h1>" + 
		"<p>In this experiment, your will see scenes of moving balls.</p>" + 
		"<p>There are two types of balls: <img src= 'figures/plus_ball.jpg' style='width:20px'> and <img src= 'figures/T_ball.jpg' style='width:20px'>. " + 
		"All scenes are filled with <img src= 'figures/plus_ball.jpg' style='width:20px'>. " +
		"But <img src= 'figures/T_ball.jpg' style='width:20px'> is present only in most (and not all) scenes, like below:</p>"+
        "<img src= 'figures/figure_scene_16balls.jpg' style='width:500px'> "+
		"<p>Your job is to simply answer <strong>whether a <img src= 'figures/T_ball.jpg' style='width:20px'> is in the scene</strong>.</p>"+
		"<p>If there is a <img src= 'figures/T_ball.jpg' style='width:20px'> in the scene, press <strong>'space'</strong> on your keyboard.</p>"+
		"<p>If there is no <img src= 'figures/T_ball.jpg' style='width:20px'> in the scene, press <strong>'n'</strong> on your keyboard .</p>"+
		"<p>We are interested in how fast you can detect the <img src= 'figures/T_ball.jpg' style='width:20px'>, so please try to respond <strong>as quickly as possible</strong>!</p>"+
		"<p>You will now go through a few training trials.</p>" ,
	choices: jsPsych.NO_KEYS,
	trial_duration: 5000,
	prompt: continue_msg,
};

var instructions_2 = {
    type: "html-keyboard-response",
    data: {test_part: 'instructions'},
    stimulus: 
		"<p>Good job! Now you know how it works. The real trials start in the next screen.</p>" + 
		"<p>Please stay focused throughout the trials, which will only take about 3 minutes.</p>" + 
		"<p>Reminder: press 'space' if the <img src= 'figures/T_ball.jpg' style='width:20px'> is in the scene. Press 'n' if it is not in the scene.</p>" + 
		"<p>Also, remember to respond <strong>as quickly as possible</strong>.</p>" + 
		"<br>" + 
		"<p>Press 'space' to start the test.</p>",    
	choices: ['space'],
	prompt: function() {
		trialCounter = 0
	}
};


// feedback
var feedback = {
    type: "html-button-response",
    data: {test_part: 'feedback'},
	stimulus: 
		"<p>Well done!We just have a few more questions:  </p>"+
		"<p>Are the videos displayed smoothly?</p>",
	choices: ['Yes', 'No', 'Yes in the beginning, but they stutter towards the end', 'Yes overall, but they stutter occasionally']
};


var question1 = {
	type: "html-button-response",
	data: {test_part: 'attention questions', correct_response: "2"},
	stimulus: 
		"<p>What is the color of elephants?</p>",
	choices: ['Pink', 'Green', 'Grey'],	
	on_finish: function(data){
		if(data.button_pressed == data.correct_response){
			data.correct = '1';
		} else {
			data.correct = '0';
		}
	},
	post_trial_gap: 100
};

var question2 = {
	type: "html-button-response",
	data: {test_part: 'attention questions', correct_response: "0"},
	stimulus: 
	"<p>Which continent is Canada located in?</p>",
	choices: ['North America', 'Asia', 'Europe'],	
	on_finish: function(data){
		if(data.button_pressed == data.correct_response){
			data.correct = '1';
		} else {
			data.correct = '0';
		}
	},
	post_trial_gap: 100
};

var question3 = {
	type: "html-button-response",
	data: {test_part: 'attention questions', correct_response: "1"},
	stimulus: 
		"<p>How many states are there in the USA?</p>",
	choices: ['20', '50', '80'],	
	on_finish: function(data){
		if(data.button_pressed == data.correct_response){
			data.correct = '1';
		} else {
			data.correct = '0';
		}
	},
	post_trial_gap: 100
};

var prolificID = {
    type: "survey-text",
    questions: [
        {prompt: "What is your Prolific ID?", rows: 1, columns: 40}, 
      ],
};



var debrief_block = {
	type: "html-keyboard-response",
	stimulus: function() {
		return "<p>Great job! You're done! Thank you for your participation.</p>"+
		"<p>Please click <strong> <a href = 'https://app.prolific.co/submissions/complete?cc=1FA3B865'>here</a></strong> to be redirected to Prolific.</p>" +
		"<p>If the link doesn't work, please copy paste the code 1FA3B865, or this address in your browser: https://app.prolific.co/submissions/complete?cc=1FA3B865.</p>"	},
	choices: jsPsych.NO_KEYS,
};




function saveData(id, data){									// record data 
	var xhr = new XMLHttpRequest();
		xhr.open("POST", "write_data.php"); 
		xhr.setRequestHeader("Content-Type", "application/json");
		xhr.send(JSON.stringify({fileid: id, filedata: data}));
}

function saveDataWrap(){
	saveData(subjectId, jsPsych.data.get().csv());
}

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

if (!skipWelcome){
	timeline.push(welcome, prolificID, consentform, getReadyMessage, instr_continue)       
}	

if (!skipInstructions){
	timeline.push(instructions_1, instr_continue)       
}	

if (!skipTraining){
	for (i = 0; i < n_training; i++){
		timeline.push(training_trial, showCorrect)
	}
}
if (!skipInstructions){
    timeline.push(instructions_2)       
}	

for (i = 0; i < n_trials; i++){
	timeline.push(test_trial, showCorrect)
}

// attention questions
if (!skipAttention){
	timeline.push(feedback);  						
	timeline.push(question1);									// attention question 
	timeline.push(question2);									// attention question 
	timeline.push(question3);									// attention question 
}

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