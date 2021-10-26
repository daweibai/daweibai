/*
 * Learning continuity violation experiment demo
by Dawei Bai 10/2021
 */
var timeline = [];

var skip_browser_check 			= false;
var skip_training 				= false;



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
var response_window = 2000;
var slow_limit 		= 500;			// for the 'try to be faster' feedback in training
var post_trial_gap 	= 500; 			// 500. the post trial gap on firefox isn't a white screen, but the previous image (frozen). So we need chrome.
var all_stim 		= new Array();		
var correct_delay	= 1000 			// 1000. pause time if response is correct 
var else_delay 		= 1000			// 1000. pause time if RT too long or wrong response

	
// keys to press
var present_key			= 38			// present = 38 = up
var present_key_string 	= 'up arrow'
var absent_key			= 40			// absent  = 40 = down
var absent_key_string 	= 'down arrow'

var img_CAP_press		= 'CP_press_up' //for images with keys in training
var img_CPA_press		= 'CA_press_down'
var img_CPP_press		= 'CP_press_up' //for images with keys in training
var img_CAA_press		= 'CA_press_down'

var in_trial_instr 		= '<p>Respond after the board is lowered whether the car is present or not</p><p>&uarr; = Present</p><p>&darr; = Absent</p>'

var fam_vio				= Math.floor(Math.random()*2)


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
}

// screen goes up
for (i = 2; i <= 6; i++){
	CA_image_set.push(stim_prefix + 'DA_CA_000' + i + stim_postfix);
	CP_image_set.push(stim_prefix + 'DA_CP_000' + i + stim_postfix);
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
			return '<p><strong>Try to be faster!</strong></p><p>&nbsp;</p><p>&nbsp;</p>';
		}
		if (last_trial.rt <= slow_limit && last_trial.key_press == last_trial.correct_response){
			return '<p><strong>Correct!</strong></p><p>&nbsp;</p><p>&nbsp;</p>'; 
		}
		if (last_trial.rt <= slow_limit && last_trial.key_press !== last_trial.correct_response){
			return '<p><strong>Wrong key!</strong></p><p>&nbsp;</p><p>&nbsp;</p>'; 
		}
		if (last_trial.rt > slow_limit && last_trial.key_press !== last_trial.correct_response){
			return '<p><strong>Wrong key, and try to be faster!</strong></p><p>&nbsp;</p><p>&nbsp;</p>'; 
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

// last image. This is where the response is recorded
// familiarization trials, with 500ms response limit
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

// crucial trial, without time limit
// last image, CAP
var CAP_crucial_last_image = {
	type: 'image-keyboard-response',
	stimulus: stim_prefix + 'DA_CP_0047' + stim_postfix,
	data: {test_part: 'CAP', trial_part: 'crucial', correct_response: present_key, violation: 1, presence: 1},
	choices: [present_key, absent_key],
	on_finish: correct_function,
	post_trial_gap: post_trial_gap
};

// last image, CPA
var CPA_crucial_last_image = {
	type: 'image-keyboard-response',
	stimulus: stim_prefix + 'DA_CA_0047' + stim_postfix,
	data: {test_part: 'CPA', trial_part: 'crucial', correct_response: absent_key, violation: 1, presence: 0},
	choices: [present_key, absent_key],
	on_finish: correct_function,
	post_trial_gap: post_trial_gap
};

// last image, CAA
var CAA_crucial_last_image = {
	type: 'image-keyboard-response',
	stimulus: stim_prefix + 'DA_CA_0047' + stim_postfix,
	data: {test_part: 'CAA', trial_part: 'crucial', correct_response: absent_key, violation: 0, presence: 0},
	choices: [present_key, absent_key],
	on_finish: correct_function,
	post_trial_gap: post_trial_gap
};


// last image, CPP
var CPP_crucial_last_image = {
	type: 'image-keyboard-response',
	stimulus: stim_prefix + 'DA_CP_0047' + stim_postfix,
	data: {test_part: 'CPP', trial_part: 'crucial', correct_response: present_key, violation: 0, presence: 1},
	choices: [present_key, absent_key],
	on_finish: correct_function,
	post_trial_gap: post_trial_gap
};


// Put together all the images to form trials. The 4 types of trials are CPA, CAA, CAP, CPP. 
// familiarization trials
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
var CPA_crucial = {
    type: 'image-keyboard-response',
	response_ends_trial: true,
    timeline: [
        CP_begin_animation,
        CPA_crucial_last_image,
    ],
	prompt: in_trial_instr,
}

var CAP_crucial = {
    type: 'image-keyboard-response',
	response_ends_trial: true,
    timeline: [
        CA_begin_animation,
        CAP_crucial_last_image,
    ],
	prompt: in_trial_instr,
}

var CAA_crucial = {
    type: 'image-keyboard-response',
	response_ends_trial: true,
    timeline: [
        CA_begin_animation,
        CAA_crucial_last_image,
    ],
	prompt: in_trial_instr,
}

var CPP_crucial = {
    type: 'image-keyboard-response',
	response_ends_trial: true,
    timeline: [
        CP_begin_animation,
        CPP_crucial_last_image,
    ],
	prompt: in_trial_instr,
}



// randomize for each bloc. 5 blocs in total
var trials_to_display = []

// first eight trials, all non-violation
var bloc_first_eight = [CAP, CPA]
trials_to_display 	= jsPsych.randomization.repeat(bloc_first_eight, 4); // first eight trials are non-violation events, randomized

//crucial trial. 
// var set_crucial 	= [CPA_crucial, CAP_crucial, CAA_crucial, CPP_crucial]
var set_crucial 	= [CPA_crucial, CAP_crucial] // to fill up one condition in our experiment where we have less pps for one condition. We want violation for the crucial trial
var crucial_trial = jsPsych.randomization.repeat(set_crucial, 1)[0] //randomly get one of the violation trials
trials_to_display.push(crucial_trial)



// Instructions and stuff
/* check for and warn if firefox */
var browser_check = {
    data: {
	test_part: 'browser-check'
    },
    type: 'html-button-response',
    button_html: '<button class="jspsych-btn" style="width: 300px;">%choice%</button><br><br><br>',
    stimulus: '<p><strong>It seems you are using Firefox or Edge - this experiment will not work properly.</strong></p><p>Please try another browser (chrome/chromium/safari are all known to work well) - if this is not possible you should return the HIT now.</p>',
    choices: ['<strong>Exit<br>experiment</strong>' /*, 'I am actually using another browser<br>- continue anyway.'*/],
    post_trial_gap: 100,
    on_finish: function (data){
	if (data.button_pressed == 0)
	    jsPsych.endExperiment('Experiment aborted. You may copy and paste the link into another browser:<br>' + window.location.href);
    },
};


// 4 training trials, 2 CAP, 2 CPA. The last image shows the key to press. They can press only the correct key

// press, CAP, last image
var CAP_press_last = {
	type: 'image-keyboard-response',
	stimulus: stim_prefix + img_CAP_press + stim_postfix, 
	data: {test_part: 'training', trial_part: 'training', correct_response: present_key},
	choices: [present_key, absent_key],
	on_finish: correct_function,
};

// press, CPA, last image
var CPA_press_last = {
	type: 'image-keyboard-response',
	stimulus: stim_prefix + img_CPA_press + stim_postfix,
	data: {test_part: 'training', trial_part: 'training', correct_response: absent_key},
	choices: [present_key, absent_key],
	on_finish: correct_function,
};

// press, CPP, last image
var CPP_press_last = {
	type: 'image-keyboard-response',
	stimulus: stim_prefix + img_CPP_press + stim_postfix, 
	data: {test_part: 'training', trial_part: 'training', correct_response: present_key},
	choices: [present_key, absent_key],
	on_finish: correct_function,
};

// press, CAA, last image
var CAA_press_last = {
	type: 'image-keyboard-response',
	stimulus: stim_prefix + img_CAA_press + stim_postfix,
	data: {test_part: 'training', trial_part: 'training', correct_response: absent_key},
	choices: [present_key, absent_key],
	on_finish: correct_function,
};



var CAP_press = {
    type: 'image-keyboard-response',
	response_ends_trial: true,
    timeline: [
        CA_begin_animation,
        CAP_press_last,
		feedback,
    ],
	prompt: in_trial_instr,

}

var CPA_press = {
    type: 'image-keyboard-response',
	response_ends_trial: true,
    timeline: [
        CP_begin_animation,
        CPA_press_last,
		feedback,
    ],
	prompt: in_trial_instr,
}


var CPP_press = {
    type: 'image-keyboard-response',
	response_ends_trial: true,
    timeline: [
        CP_begin_animation,
        CPP_press_last,
		feedback,
    ],
	prompt: in_trial_instr,
}

var CAA_press = {
    type: 'image-keyboard-response',
	response_ends_trial: true,
    timeline: [
        CA_begin_animation,
        CAA_press_last,
		feedback,
    ],
	prompt: in_trial_instr,
}


//to be added to timeline: 4 training trials

if (fam_vio == 1 ) {
	var training_set 			= [CAP_press, CPA_press]
} else {
	var training_set 			= [CAA_press, CPP_press]
}




var training_to_display 	= jsPsych.randomization.repeat(training_set, 10);




// *** Timeline *** /// 

if ((is_firefox || isEdge)){
	timeline.push(browser_check);
}															// browser check



timeline = timeline.concat(training_to_display); 			// training bloc

	


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



/*Run the experiment */
jsPsych.init({
	timeline: timeline,
	// on_finish: function() { 
	// 	jsPsych.data.displayData(''); 
	// }
	}
);
