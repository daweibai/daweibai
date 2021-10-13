/*
 * Learning continuity violation experiment 2
	test trial is prediction + confidence rating
	fam trials are the same as exp 1 (detection)
	12/2020 by Dawei Bai
 */
var timeline = [];

var skip_browser_check 			= false;
var skip_preload 				= false;
var skip_instructions 			= true;
var skip_training 				= true;
var skip_fam					= true;
var fast_instructions 			= false;
var skip_attention_questions 	= false;
var skip_debrief 				= false;
var show_data_mid				= false;		// if true, shows the data after test bloc

var continue_msg 				= '(option to continue will appear after a short delay)';

/* Browser info */
// from : https://stackoverflow.com/questions/9847580/how-to-detect-safari-chrome-ie-firefox-and-opera-browser
var is_firefox = typeof InstallTrigger !== 'undefined';
var isIE = /*@cc_on!@*/false || !!document.documentMode;
var isEdge = !isIE && !!window.StyleMedia;
var useragent_string = navigator.userAgent;

/* create stimulus for animation */
var stim_prefix 	= 'img/';
var stim_postfix 	= '.jpg';
var ftime 			= 33;
var slow_limit 		= 500;			// for the 'try to be faster' feedback in training
var post_trial_gap 	= 500; 			// 500. the post trial gap on firefox isn't a white screen, but the previous image (frozen). So we need chrome.
var correct_delay	= 1000 			// 1000. pause time if response is correct 
var else_delay 		= 1000			// 1000. pause time if RT too long or wrong response

	
// keys to press
var present_key			= 38			// present = 38 = up
var present_key_string 	= 'up arrow'
var absent_key			= 40			// absent  = 40 = down
var absent_key_string 	= 'down arrow'

var img_CPP_press		= 'CP_press_up' //for images with keys in training
var img_CAA_press		= 'CA_press_down'

var in_trial_instr 		= '<p>up = "present"</p><p>down = "absent"</p>'

var exp_version			= 'pilot1, exp2 (test trial prediction & confidence)'
// randomly define whether the fam trials will be violations trials or non-violation trials
var randomizer_fam = Math.floor(Math.random() * 2)
if (randomizer_fam == 0){ // non-vio
	var fam_vio			= 0
} else { 			 	  // vio
	var fam_vio			= 1
}


// randomly define whether the crucial trial will start with the car absent or present
var randomizer_crucial = Math.floor(Math.random() * 2)
if (randomizer_crucial == 0){ // absent at beginning
	var crucial_presence = 0
} else{							// present at beginning
	var crucial_presence = 1
}


//	record correct 
correct_function = function(data){
		if(data.key_press == data.correct_response){
			data.correct = '1';
		} else if (data.key_press == null){ 
			data.correct = 'miss';
		} else {
			data.correct = '0';
		}
	}

// variables for the animations
// CA = car absent. CP = car present.
var CA_image_set 	= [];
var CP_image_set 	= [];
var CA_image_set_crucial 	= [];
var CP_image_set_crucial 	= [];

var begin_pause 	= 40; //number of frames for the very first image 
var middle_pause 	= 40; //number of frames for the image where the screen is up

var CA_begin		= 'DA_CA_0001'
var CP_begin 		= 'DA_CP_0001'

var CA_CP_middle	= 'DA_CP_0008'

var trial_part_test = 'test'

// add pause in the beginning 
for (i = 1; i <= begin_pause; i++){
	CA_image_set.push(stim_prefix + CA_begin + stim_postfix);
	CP_image_set.push(stim_prefix + CP_begin + stim_postfix);

	CA_image_set_crucial.push(stim_prefix + CA_begin + stim_postfix);
	CP_image_set_crucial.push(stim_prefix + CP_begin + stim_postfix);
}

// screen goes up
for (i = 2; i <= 6; i++){
	CA_image_set.push(stim_prefix + 'DA_CA_000' + i + stim_postfix);
	CP_image_set.push(stim_prefix + 'DA_CP_000' + i + stim_postfix);

	CA_image_set_crucial.push(stim_prefix + 'DA_CA_000' + i + stim_postfix);
	CP_image_set_crucial.push(stim_prefix + 'DA_CP_000' + i + stim_postfix);
}

// add pause in the middle (while screen is up) 
for (i = 1; i <= middle_pause; i++){
	CA_image_set.push(stim_prefix + CA_CP_middle + stim_postfix);
	CP_image_set.push(stim_prefix + CA_CP_middle + stim_postfix);
}

// screen goes down (before revealing)
for (i = 41; i <= 43; i++){
	CA_image_set.push(stim_prefix + 'DA_CA_00' + i + stim_postfix);
	CP_image_set.push(stim_prefix + 'DA_CP_00' + i + stim_postfix);
}


//feedback common to all trials. 
var feedback = {
    type: 		'image-keyboard-response',
    data: 		jsPsych.timelineVariable('data'),
    stimulus: 	function () {
	return jsPsych.data.get().last(1).values()[0].stimulus;
    },
    choices: jsPsych.NO_KEYS,
    prompt: function(){
		var last_trial = jsPsych.data.get().last(1).values()[0];	//display a message according to whether it's correct or not, and RT
		if (last_trial.rt > slow_limit && last_trial.key_press == last_trial.correct_response){
			return '<p><strong>Try to be faster!</strong></p><p>&nbsp;</p>';
		}
		if (last_trial.rt <= slow_limit && last_trial.key_press == last_trial.correct_response){
			return '<p><strong>Correct!</strong></p><p>&nbsp;</p>'; 
		}
		if (last_trial.rt <= slow_limit && last_trial.key_press !== last_trial.correct_response){
			return '<p><strong>Wrong key!</strong></p><p>&nbsp;</p>'; 
		}
		if (last_trial.rt > slow_limit && last_trial.key_press !== last_trial.correct_response){
			return '<p><strong>Wrong key, and try to be faster!</strong></p><p>&nbsp;</p>'; 
		}
    },
    on_finish: function(data){
	data.trial_part = 'feedback';
    },
	trial_duration: function(){										// pause after response, the duration of the pause depends on correctness. Finally I used  the same pause length for both cases
		var last_trial = jsPsych.data.get().last(1).values()[0];
		if (last_trial.rt > slow_limit && last_trial.key_press == last_trial.correct_response){
			return else_delay;
		}
		if (last_trial.rt <= slow_limit && last_trial.key_press == last_trial.correct_response){
			return correct_delay;  
		}
		if (last_trial.rt <= slow_limit && last_trial.key_press !== last_trial.correct_response){
			return else_delay; 
		}
		if (last_trial.rt > slow_limit && last_trial.key_press !== last_trial.correct_response){
			return else_delay; 
		}			
	}, 
	post_trial_gap: post_trial_gap
};



// animation with CAR ABSENT in the beginning. Keyboard press deactivated
var CA_begin_animation = {
	type: 'animation',
	stimuli: CA_image_set,
	frame_time: ftime,
	sequence_reps: 1,
};

// animation with CAR PRESENT in the beginning. Keyboard press deactivated
var CP_begin_animation = {
	type: 'animation',
	stimuli: CP_image_set,
	frame_time: ftime,
	sequence_reps: 1,	
};

// crucial trial begin_animation
var CA_begin_animation_crucial = {
	type: 'animation',
	stimuli: CA_image_set_crucial,
	frame_time: ftime,
	sequence_reps: 1,
	prompt: in_trial_instr,
	render_on_canvas : true

};

var CP_begin_animation_crucial = {
	type: 'animation',
	stimuli: CP_image_set_crucial,
	frame_time: ftime,
	sequence_reps: 1,	
	prompt: in_trial_instr,
	render_on_canvas : true

};

// last image. This is where the response is recorded
// familiarization trials, with 500ms response limit
// last image, CAA
var CAA_last_image = {
	type: 'image-keyboard-response',
	stimulus: stim_prefix + 'DA_CA_0047' + stim_postfix,
	data: {test_part: 'CAA', trial_part: 'familiarization', correct_response: absent_key, violation: 0, presence: 0},
	choices: [present_key, absent_key],
	on_finish: correct_function,
	trial_duration: 500,
	post_trial_gap: post_trial_gap
};


// last image, CPP
var CPP_last_image = {
	type: 'image-keyboard-response',
	stimulus: stim_prefix + 'DA_CP_0047' + stim_postfix,
	data: {test_part: 'CPP', trial_part: 'familiarization', correct_response: present_key, violation: 0, presence: 1},
	choices: [present_key, absent_key],
	on_finish: correct_function,
	trial_duration: 500,
	post_trial_gap: post_trial_gap
};

// last image, CAP
var CAP_last_image = {
	type: 'image-keyboard-response',
	stimulus: stim_prefix + 'DA_CP_0047' + stim_postfix,
	data: {test_part: 'CAP', trial_part: 'familiarization', correct_response: present_key, violation: 1, presence: 1},
	choices: [present_key, absent_key],
	on_finish: correct_function,
	trial_duration: 500,
	post_trial_gap: post_trial_gap
};

// last image, CPA
var CPA_last_image = {
	type: 'image-keyboard-response',
	stimulus: stim_prefix + 'DA_CA_0047' + stim_postfix,
	data: {test_part: 'CPA', trial_part: 'familiarization', correct_response: absent_key, violation: 1, presence: 0},
	choices: [present_key, absent_key],
	on_finish: correct_function,
	trial_duration: 500,
	post_trial_gap: post_trial_gap
};


// crucial trial's last image, without time limit. Ask for prediction
// last image
var crucial_last_image = {
	type: 'image-keyboard-response',
	stimulus: stim_prefix + CA_CP_middle + stim_postfix,
	data: {trial_part: 'prediction', crucial_presence: crucial_presence},
	choices: jsPsych.NO_KEYS,
	render_on_canvas: true,
	prompt: function() {
		return '<p>Will the car be present or absent when the board is lowered?</p>'+ 
		'<p><button id = "button_pr" class="jspsych-btn">Present</button>   <button id = "button_ab" class="jspsych-btn">Absent</button></p>'
	},
	on_load: function(){
		document.getElementById("button_pr").addEventListener("click", endTrial_pr);
		function endTrial_pr() {
			jsPsych.finishTrial()
			jsPsych.data.write({pressed : 'present'})
		}
		
		document.getElementById("button_ab").addEventListener("click", endTrial_ab);
		function endTrial_ab() {
			jsPsych.finishTrial()
			jsPsych.data.write({pressed : 'absent'})
		}
	},

};


var confidence_rating = {
	type: 'survey-likert',
	data: {trial_part: 'confidence', crucial_presence: crucial_presence},
	questions: [
		{prompt: "<img src= 'img/DA_CP_0008.jpg' style='width:854px'><p>How confident are you about this?</p>",
		 labels: [
			"1 <p>Not confident at all</p>", 
			"2", 
			"3", 
			"4", 
			"5", 
			"6", 
			"7 <p>Very confident</p>"
		  ]}
	  ],
};


// Put together all the images to form trials. The 4 types of trials are CPA, CAA, CAP, CPP. 
// familiarization trials
var CAA = {
    type: 'image-keyboard-response',
	response_ends_trial: true,
    timeline: [
        CA_begin_animation,
        CAA_last_image,
    ],
	prompt: in_trial_instr,
}

var CPP = {
    type: 'image-keyboard-response',
	response_ends_trial: true,
    timeline: [
        CP_begin_animation,
        CPP_last_image,
    ],
	prompt: in_trial_instr,
}

var CAP = {
    type: 'image-keyboard-response',
	response_ends_trial: true,
    timeline: [
        CA_begin_animation,
        CAP_last_image,
    ],
	prompt: in_trial_instr,
}

var CPA = {
    type: 'image-keyboard-response',
	response_ends_trial: true,
    timeline: [
        CP_begin_animation,
        CPA_last_image,
    ],
	prompt: in_trial_instr,
}

// crucial trial 
var CP_crucial = {
    type: 'image-keyboard-response',
	response_ends_trial: true,
    timeline: [
        CP_begin_animation_crucial,
        crucial_last_image,
	],
	render_on_canvas : true
	// prompt: in_trial_instr,
}

var CA_crucial = {
    type: 'image-keyboard-response',
	response_ends_trial: true,
    timeline: [
        CA_begin_animation_crucial,
        crucial_last_image,
	],
	render_on_canvas : true
	// prompt: in_trial_instr,
}


// randomize for each bloc. 5 blocs in total
var trials_to_display = []

if (randomizer_fam == 0){ // non-vio
	var bloc_first_eight = [CAA, CPP]
} else { 			 // vio
	var bloc_first_eight = [CAP, CPA]
}

// first eight trials
if (!skip_fam){
	trials_to_display 	= jsPsych.randomization.repeat(bloc_first_eight, 4); // first eight trials are non-violation events, randomized
}


//crucial trial. 
if (randomizer_crucial == 0){ // absent at beginning
	trials_to_display.push(CA_crucial)
} else{
	trials_to_display.push(CP_crucial)
}



// Instructions and stuff
/* check for and warn if firefox */
var browser_check = {
    data: {
	test_part: 'browser-check'
    },
    type: 'html-button-response',
    button_html: '<button class="jspsych-btn" style="width: 300px;">%choice%</button><br><br><br>',
    stimulus: '<p><strong>It seems you are using Firefox or Edge - this experiment will not work properly.</strong></p><p>Please try another browser (chrome/chromium/safari are all known to work well).</p>',
    choices: ['<strong>Exit<br>experiment</strong>' /*, 'I am actually using another browser<br>- continue anyway.'*/],
    post_trial_gap: 100,
    on_finish: function (data){
	if (data.button_pressed == 0)
	    jsPsych.endExperiment('Experiment aborted. You may copy and paste the link into another browser:<br>' + window.location.href);
    },
};

var welcome = {
      type: "html-keyboard-response",
      stimulus: "Welcome to the experiment. Press any key to begin."
    };

var consentform = {
	type: "html-button-response",
	stimulus: 
		"<p>Please read the following agreement to participate.</p>"+
		"<h3>Description of the study:</h3>"+
		"<p>The purpose of the study is to understand visual perception.</p>"+
		"<h3>Risks, Benefits, and Confidentiality: </h3>"+
		"<p>There are no known risks. You will receive a compensation, as is indicated on Prolific. All of</p>"+
		"<p>your responses will be held anonymously. Only the researchers involved in this study and </p>"+
		"<p>those responsible for research oversight will have access to the information you provide.</p>"+
		"<p>Your data and information will be completely confidential.</p>"+
		"<h3>Time Commitment: </h3>"+
		"<p>The study will take 3 - 4 minutes. </p>"+
		"<h3>Voluntary Participation: </h3>"+
		"<p>Participation in this study is completely voluntary.</p>"+
		"<h3>Contact Information: </h3>"+
		"<p>If you have any questions or concerns about any aspect of the study, please feel free to </p>"+
		"<p>contact dawei.bai@ens.fr.</p>"+
		"<p>If you agree with this consent form, press the button \'I agree\'.</p>"+
		"</div>",
	choices: ['I agree'],	
	post_trial_gap: 100
};

// instructions
/* generic screen repeating last instruction screen but allowing to continue after keypress */
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

var instructions_0 = {
    data: {test_part: 'instructions'},
    type: "html-keyboard-response",
    stimulus: '<h1>Let&#39;s get ready...</h1>&nbsp;'+
		'<br>When the experiment begins, you will sometimes need to answer quickly by pressing a key on your keyboard.<br>'+
		'<br>Things you need to do to make sure everything works fine:<ul> '+
		'<li>Maximize your browser window and make sure you can comfortably watch the screen and use the keyboard.</li>' +
		'<li>Close any performance demanding program, so your computer works fast enough.</li>' +
		'<li>Close any chat programs or phone, so as not to be interrupted.</li> '+
		'<li><strong>Be prepared to remain equally attentive and alert for the duration of the experiment</strong>:'+
		'<br>your data will only be useful to us if you stay focused throughout the entire study. It&#39;s quite short, so there is no need to take a break before the end.<br></li></ul>&nbsp;<div style="text-align: center;">'+
		'<em>Next: Instructions</em></div>',
    choices: jsPsych.NO_KEYS,
    trial_duration: 5000,
	prompt: continue_msg,
};


var instructions_1 = {
    data: {test_part: 'instructions'},	
	type: "html-keyboard-response",
	stimulus: 
	"<h1>Instructions (1/2)</h1>" +	
	"<p>&nbsp;</p>" +
	"<p>In this experiment, you will see short videos. In each video, a paper board will be held vertically on the floor: </p>" + 
	"<img src= 'img/DA_CP_0008.jpg' style='width:400px'> "+
	"<p>A toy car is possibly hidden behind the paper board.</p>" +
	"<p>Then the board will drop, revealing either the car or an empty space: </p>" + 
	"<img src= 'img/DA_CP_0047.jpg' style='width:400px'> "+
	"<img src= 'img/DA_CA_0047.jpg' style='width:400px'> "+
	"<p>Your job is simply to detect after the board is lowered whether the toy car is present or not. </p>"+
	"<p>Press <strong>"+ present_key_string + "</strong> on your keyboard if the car is <strong>present</strong>, <strong>"+ absent_key_string + "</strong> if the car is <strong>absent</strong>.</p>"+
	"<p>&nbsp;</p>",
    choices: jsPsych.NO_KEYS,
    trial_duration: 10000,
    prompt: continue_msg,
};

var instructions_2 = {
    data: {test_part: 'instructions'},
    type: "html-keyboard-response",
    stimulus: 
	"<h1>Instructions (2/2)</h1>" +	
	"<p>&nbsp;</p>" +
	"<p>We are interested in how quickly you can detect the car, so give your answers <strong>as quickly as possible</strong>.</p>" + 
	"<p>In order to do so, keep your fingers in place for the duration of the experiment.</p>"  + 
	"<p>You must answer only <strong>after the board is lowered</strong>; 'guesses' given before the board fall will not count as valid answers.</p>" +
	"<p>&nbsp;</p>"+
	"<p>You will now go through a few practice trials. Please place your fingers on <strong>"+ present_key_string + "</strong> and <strong>"+ absent_key_string + "</strong> keys on your keyboard now.</p>",
	choices: jsPsych.NO_KEYS,
    trial_duration: 5000,
    prompt: continue_msg,
};

// 4 training trials, 2 CAA, 2 CPP. The last image shows the key to press. They can press only the correct key

// press, CPP, last image
var CP_press_last = {
	type: 'image-keyboard-response',
	stimulus: stim_prefix + img_CPP_press + stim_postfix, 
	data: {test_part: 'training', trial_part: 'training', correct_response: present_key},
	choices: [present_key, absent_key],
	on_finish: correct_function,
};

// press, CAA, last image
var CA_press_last = {
	type: 'image-keyboard-response',
	stimulus: stim_prefix + img_CAA_press + stim_postfix,
	data: {test_part: 'training', trial_part: 'training', correct_response: absent_key},
	choices: [present_key, absent_key],
	on_finish: correct_function,
};

var CPP_press = {
    type: 'image-keyboard-response',
	response_ends_trial: true,
    timeline: [
        CP_begin_animation,
        CP_press_last,
		feedback,
    ],
	prompt: in_trial_instr,
}

var CAA_press = {
    type: 'image-keyboard-response',
	response_ends_trial: true,
    timeline: [
        CA_begin_animation,
        CA_press_last,
		feedback,
    ],
	prompt: in_trial_instr,
}

var CPA_press = {
    type: 'image-keyboard-response',
	response_ends_trial: true,
    timeline: [
        CP_begin_animation,
        CA_press_last,
		feedback,
    ],
	prompt: in_trial_instr,
}

var CAP_press = {
    type: 'image-keyboard-response',
	response_ends_trial: true,
    timeline: [
        CA_begin_animation,
        CP_press_last,
		feedback,
    ],
	prompt: in_trial_instr,
}


// to be added to timeline: 4 training trials
if (randomizer_fam == 0){ // non-vio
	var training_set		= [CPP_press, CAA_press]
} else { 			  // vio
	var training_set		= [CPA_press, CAP_press]
}

var training_to_display 	= jsPsych.randomization.repeat(training_set, 2);


//instructions right after training 
var instructions_3 = {
    data: {test_part: 'instructions'},
    type: "html-keyboard-response",
    stimulus: 
		"<p>Great job! Now you know how it works. The real trials start in the next screen.</p>" + 
		"<p>Please place your fingers on <strong>"+ present_key_string + "</strong> ('<strong>present</strong>') and <strong>"+ absent_key_string + "</strong> ('<strong>absent</strong>') on your keyboard now.</p>" +
		"<p><strong>In the real trials, you will only have half a second to respond. If you do not respond within this time limit, the screen will automatically move on to the next trial.</strong></p>" +
		"<p>So try to answer <strong>as quickly as possible</strong> (but only <strong>after the board falls</strong>).</p>" +
		"<p>&nbsp;</p>",
	choices: jsPsych.NO_KEYS,
    trial_duration: 5000,
    prompt: continue_msg,
};



// Attention questions

var question0 = {
	type: 'survey-multi-choice',
	data: {test_part: 'feedback'},
	questions: [
		{prompt: "Well done! We just have a few more questions:<p>Were the videos displayed smoothly?</p>", 
		options: ['Yes', 'No', 'Yes overall, but they stutter or flicker occasionally'], 
		required: true}, 
	],
	post_trial_gap: 100
  };

var question1 = {
	type: "survey-multi-choice",
	data: {test_part: 'attention'},
	questions: [
		{prompt: "What is the color of elephants?", 
		options: ['Pink', 'Green', 'Grey'], 
		required: true}, 
	],
	post_trial_gap: 100
};

var question2 = {
	type: "survey-multi-choice",
	data: {test_part: 'attention'},
	questions: [
		{prompt: "Which continent is Canada located in?", 
		options: ['North America', 'Asia', 'Europe'], 
		required: true}, 
	],
	post_trial_gap: 100
};

var question3 = {
	type: "survey-multi-choice",
	data: {test_part: 'attention'},
	questions: [
		{prompt: "How many states are there in the USA?", 
		options: ['20', '50', '80'], 
		required: true}, 
	],
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
		"<p>If the link doesn't work, please copy paste the code '1FA3B865' on Prolific or go to the address: https://app.prolific.co/submissions/complete?cc=1FA3B865.</p>"	},
	choices: jsPsych.NO_KEYS,
};


// *** Timeline *** /// 

if (!skip_instructions){
	if ((is_firefox || isEdge)){
		timeline.push(browser_check);
	}															// browser check
	timeline.push(welcome); 									// welcome
	timeline.push(prolificID);	
	timeline.push(consentform); 								// consent form
	// instructions
	timeline.push(instructions_0, instr_continue);				// instructions
	timeline.push(instructions_1, instr_continue);				// instructions		
	timeline.push(instructions_2, instr_continue);				// instructions		
}	

if (!skip_training){
	timeline = timeline.concat(training_to_display); 			// training bloc
	timeline.push(instructions_3, instr_continue)				// instructions		
}
	
function saveData(id, data){									// record data 
	var xhr = new XMLHttpRequest();
		xhr.open("POST", "write_data.php"); 
		xhr.setRequestHeader("Content-Type", "application/json");
		xhr.send(JSON.stringify({fileid: id, filedata: data}));
}

function saveDataWrap(){
	saveData(subjectId, jsPsych.data.get().csv());
}
var subjectId = jsPsych.randomization.randomID(8);
	jsPsych.data.addProperties({subject: subjectId, exp_version: exp_version, fam_vio: fam_vio, crucial_presence: crucial_presence});
	

// test bloc 
timeline = timeline.concat(trials_to_display) 					// test bloc 
timeline.push(confidence_rating)

if (show_data_mid){
	jsPsych.init({
		timeline: timeline,
		on_finish: function() { 
			jsPsych.data.displayData(''); 
		}
		}
	);
}
	

// attention questions
if (!skip_attention_questions){
	timeline.push(question0);									// attention question 
	timeline.push(question1);									// attention question 
	timeline.push(question2);									// attention question 
	timeline.push(question3);									// attention question 
}

/* save some final subject-level data */
timeline.push({
    type: 'call-function',
    func: function() {},
    on_finish: function(data){
        data.test_part = 'summary';
        data.user_agent = navigator.userAgent;
        data.trial_part = 'interaction_data';
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

timeline.push({												// end recording data 
	type: 'call-function',
	func: saveDataWrap,
});


if (!skip_debrief){
	timeline.push(debrief_block);  								
};

/*Run the experiment */
	jsPsych.init({
		timeline: timeline,
		on_finish: function(data){

				// Serialize the data
				var promise = new Promise(function(resolve, reject) {
					var data = jsPsych.data.dataAsJSON();
					resolve(data);
				})

				promise.then(function(data) {


					$.ajax({
						type: "POST",
						url: '/save',
						data: { "data": data },
						success: function(){ document.location = "/" },
						dataType: "application/json",

						// Endpoint not running, local save
						error: function(err) {

							if (err.status == 200){
								document.location = "/";
							} else {
								// If error, assue local save
								jsPsych.data.localSave('digit-span_results.csv', 'csv');
							}
						}
					});
				})
			}
			
		
		}
	);

