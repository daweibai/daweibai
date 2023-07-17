// Naive physics pilot 3: ball comes out BELOW curtain experiment
// Ball fall on curved surface, then roll over cliff
// By Dawei Bai 
// 12/2020 

//-------------------------------------------------------------------------
// global constants and variables
//-------------------------------------------------------------------------
let skip_welcome_consent		= true,
    skip_instructions 			= true,
    skip_training 				= false,
    skip_attention_questions 	= false,
    skip_debrief 				= false;

const task_version    = 'pilot 3 - below',

    instr_duration  = 5000,
    fixation_duration = 1000,
    post_trial_gap  = 100,
    n_trial         = 54,    // 54 in total
    n_train_trial   = 6,      // 6 

    g             = 0.2,
    r_ball        = 7,
    pi            = Math.PI,
    cliff_height  = 275,
    cliff_length  = 400,
    gap           = 10,
    X_init_pos    = 50,     // initial x positions of the ball  

    inst_x        = 30,     // instruction position
    inst_y        = 410,

    h_occl_min    = 320,    // occluder height range
    h_occl_max    = 560,
    h_occl_step   = 30,

    w_occlu       = 680,
    r_curve       = 70,    // radius of the curve
    w_edge        = 30,    // width of the little edge on top of the curve

    windowH       = 600,    // canvas size
    windowW       = 1100;    // canvas size

let train_counter   = 0,
    counter         = 0,
    listening       = false,

    timeline        = [];

// add some data colomns
let subjectId = jsPsych.randomization.randomID(8);		// ID
jsPsych.data.addProperties({subject: subjectId, task_version: task_version});
jsPsych.data.addProperties({Window_width : window.innerWidth, Window_height : window.innerHeight}); 	//Record browser window size.


// the height-distance array from which randomly draw height (which gives a on-cliff speed of 6, 8 or 10)and occluder width (100, 150, ... or 500). 
// Note: occluder width is the distance between the right side of the cliff and the right side of the occluder (so in reality it's 10px thinner)
// Each object is an array [height, distance]
// so 27 combinations in total, each presented twice. That makes 54 trials
height_distance_array = []
let height_tmp
for (speed = 6; speed <= 10; speed += 2) {
    height_tmp = cliff_height - ((speed * speed)/(2*g)) - r_ball
	for (h_occl = h_occl_min; h_occl <= h_occl_max; h_occl += h_occl_step) {
		height_distance_array.push([height_tmp, h_occl])
	}
}

height_distance_shuffled         = jsPsych.randomization.repeat(height_distance_array, 2)       // randomize this array. This gives us the trials 
height_distance_shuffled_train   = jsPsych.randomization.repeat(height_distance_array, 1)       // training trials 

let posx         // for recording x pos of the outcoming ball
var t0, t1       // for recording RT. RT = t1 - t0
var move = false // switch. true if mouse is moving, false if not. This is avoid showing the outcoming ball where it was in the last trial. 
let stopID       // for stopping animation (requestAnimationFrame)


//-------------------------------------------------------------------------
// functions for trials

//-------------------------------------------------------------------------

// tracks mouse position
function mouseTrack(e) {        
    if (e.x <= windowW && e.x >= cliff_length + gap && e.y <= windowH) { // only inside the canvas
        move = true 
        posx = e.x
        // console.log(posx)
    }
}

// end trial if click
function endTrial(e) {   
    if (e.x <= windowW && e.x >= cliff_length + gap && e.y <= windowH) { 
        jsPsych.finishTrial()
        window.removeEventListener('click', endTrial)
        cancelAnimationFrame(stopID)        //stop requestAnimationFrame
        t1 = performance.now()          // end RT recording

        // save data
        jsPsych.data.write({x_click : e.x, y_click : e.y, h_occl: h_occl, h_ball: h_ball, v_ball: v_x_cliff, rt : t1 - t0, n_trial: counter, n_trial_train: train_counter}) 
    }
}
        
// rezise the canvas to fill the window
function resize() {             
    canvas.width = windowW;
    canvas.height = windowH;
    canvas2.width = windowW;
    canvas2.height = windowH;
}


// draw animation
function draw() {           
    // each frame
    if ((x_ball >= cliff_length + r_ball) && (listening == false)) {  // the first frame when the ball leaves the cliff
        window.addEventListener('click', endTrial);     // start listening for mouse movement and clicks
        window.addEventListener('mousemove', mouseTrack);
        t0 = performance.now()          // start recording RT. 
        listening = true                // so that we add the listeners only once
    }
    
    context2.clearRect(0, 0, windowW, windowH)
    
    // draw ball
    context2.beginPath();

    // ball falling
    if (y_ball <= cliff_height - r_curve){
        y_ball = y_ball + v_y
        x_ball = x_ball + v_x
        v_y    = v_y + g

        context2.arc(x_ball, y_ball, r_ball, 0, 2 * pi);    
        context2.fillStyle = "black";
        context2.fill();
        
    // ball on curve
    } else if (alpha < pi/2){ 
        
        if (((r_curve - cliff_height + y_ball)/(r_curve-r_ball)) <= 1) { // keep this value not higher than 1. Otherwise asin() would blow up
            angle = (r_curve - cliff_height + y_ball)/(r_curve-r_ball)
        } else {
            angle = 1
        }               

        alpha = Math.asin(angle)
        v_x   = Math.sqrt(2 * g * (y_ball - h_ball)) * Math.sin(alpha)
        v_y   = Math.sqrt(2 * g * (y_ball - h_ball)) * Math.cos(alpha)

        x_ball = x_ball + v_x
        y_ball = y_ball + v_y
        
        context2.arc(x_ball, y_ball, r_ball, 0, 2 * pi);    
        context2.fillStyle = "black";
        context2.fill();
    
    // ball on the cliff     
    } else if (x_ball < cliff_length + r_ball){ 
        v_y = 0
        v_x = v_x_cliff

        x_ball = x_ball + v_x
        y_ball = cliff_height - r_ball

        context2.arc(x_ball, y_ball, r_ball, 0, 2 * pi);    
        context2.fillStyle = "black";
        context2.fill();
    
    // ball falling in parabola
    // } else if (move == false) {
    //     v_y = v_y + g
        
    //     x_ball = x_ball + v_x
    //     y_ball = y_ball + v_y
        
    //     context2.arc(x_ball, y_ball, r_ball, 0, 2 * pi);    
    //     context2.fillStyle = "black";
    //     context2.fill();

    // outcoming ball
    } else if (move == true) {     

        context2.setLineDash([2, 2]);
        context2.arc(posx, h_occl + r_ball, r_ball, 0, 2 * pi)    
        context2.fillStyle = "white"
        context2.lineWidth = 2
        context2.fill();
        context2.stroke();
    }
    stopID = window.requestAnimationFrame(draw) // make magic happen!!!
}



// draw static things
function drawStatic() {
    // curve
    context.beginPath();
    context.moveTo(0, cliff_height - r_curve); // highest point
    context.lineTo(0, cliff_height + 2);       // + 2 because in chrome we see a little gap
    context.lineTo(X_init_pos - r_ball + r_curve, cliff_height + 2);
    context.arc(X_init_pos - r_ball + r_curve, cliff_height - r_curve, r_curve, Math.PI/2, Math.PI)
    context.fillStyle = "grey";
    context.fill();

    // cliff
    context.beginPath();
    context.rect(0, cliff_height, cliff_length, windowH)    
    context.fillStyle = "grey";
    context.fill();
    
    // occluder
    context.beginPath();
    context.rect(cliff_length + gap, 0, w_occlu, h_occl)    
    context.fillStyle = '#2185C5';
    context.fill();
}



//-------------------------------------------------------------------------
// design trials
//-------------------------------------------------------------------------
// Training trial
var training = {       // each trial
    type:       'html-button-response',     
    data: {test_part: 'training'},
    stimulus: 	'<canvas id="cw" style="z-index: 2; position:absolute; left:1px; top:0px;border: 2px solid black;"></canvas>'+   // canvas on top, for static objects
                '<canvas id="cw2" style="z-index: 1; position:absolute; left:1px; top:0px;border: 2px solid black;"></canvas>',  // canvas at bottom, for animation
    response_ends_trial: true,
    choices: [],
    on_load: function() {                   // here we draw all the stimuli
        train_counter = train_counter + 1               // trial counter
	    h_ball 	= height_distance_shuffled_train[train_counter-1][0]     // ball speed 
        h_occl 	= height_distance_shuffled_train[train_counter-1][1]   	 // position of the wall
        x_ball	= X_init_pos 		    // initial X position
        y_ball  = h_ball	            // initial Y position
        v_x     = 0
        v_y     = 0
        alpha   = 0 
        angle   = 0 
        v_x_cliff = Math.sqrt(2* g* (cliff_height - h_ball - r_ball))
        
        // jsPsych.data.write({h_occl: h_occl, h_ball: h_ball, v_ball: v_x_cliff})
       
        canvas  = document.getElementById("cw");
        context = canvas.getContext("2d");
        canvas2  = document.getElementById("cw2");
        context2 = canvas2.getContext("2d");

        // resize canvas
        resize()

        // draw animation
        draw() 
        
        listening = false        

        move = false 

        // draw static things
        drawStatic()
        
        // in-trial instructions
        context.font = '17px serif';
        context.fillStyle = "white";
        context.fillText('Where would the ball come out below the curtain?', inst_x, inst_y)
        context.fillText('Move your mouse such that the dotted ball is at ', inst_x, inst_y + 25)
        context.fillText('the position where the ball would come out,', inst_x, inst_y + 50)
        context.fillText('then click to respond.', inst_x, inst_y + 75)
    },
    on_finish: function(data) {
        window.removeEventListener('mousemove', mouseTrack) // stop event listener for mouse tracking after a trial is finished
    }
}       

// show fixation and training trials, to be added later to timeline
function show_training() {
    for (i = 1; i <= n_train_trial; i++) { 
        // fixation cross	
        h_tmp 	= height_distance_shuffled_train[i-1][0]     // ball height 
    
        var fixation_hori = {
            obj_type: 'line',
            x1: X_init_pos-7.5,
            y1: h_tmp - r_ball,
            x2: X_init_pos+7.5,
            y2: h_tmp - r_ball,       
            line_width: 3,
            line_color: 'black',
        }
         
        var fixation_verti = {
            obj_type: 'line',
            x1: X_init_pos,
            y1: h_tmp - r_ball - 7.5,
            x2: X_init_pos,
            y2: h_tmp - r_ball + 7.5,       
            line_width: 3,
            line_color: 'black', 
        }
    
        fixation_list = []
        fixation_list.push(fixation_hori)			
        fixation_list.push(fixation_verti)		
        
        var fixation = {
            type: 'psychophysics',
            stimuli: fixation_list,
            trial_duration: fixation_duration,
            background_color: 'white',
            choices: jsPsych.NO_KEYS,
        }
            
        timeline.push(fixation)	
        timeline.push(training)	
    }
}

// Test trial
var test = {       // each trial
    type:       'html-button-response',     
    data: {test_part: 'test'},
    stimulus: 	'<canvas id="cw" style="z-index: 2; position:absolute; left:1px; top:0px;border: 2px solid black;"></canvas>'+   // canvas on top, for static objects
                '<canvas id="cw2" style="z-index: 1; position:absolute; left:1px; top:0px;border: 2px solid black;"></canvas>',  // canvas at bottom, for animation
    response_ends_trial: true,
    choices: [],
    on_load: function() {                   // here we draw all the stimuli
        counter = counter + 1   // trial counter
	    h_ball 	= height_distance_shuffled[counter-1][0]     // ball speed 
        h_occl 	= height_distance_shuffled[counter-1][1]   	 // position of the wall
        x_ball	= X_init_pos 		    // initial X position
        y_ball  = h_ball	            // initial Y position
        v_x     = 0
        v_y     = 0
        alpha   = 0 
        angle   = 0 
        v_x_cliff = Math.sqrt(2* g* (cliff_height - h_ball - r_ball))
        
        // jsPsych.data.write({h_occl: h_occl, h_ball: h_ball, v_ball: v_x_cliff, n_trial: counter})
       
        canvas  = document.getElementById("cw");
        context = canvas.getContext("2d");
        canvas2  = document.getElementById("cw2");
        context2 = canvas2.getContext("2d");
        
        // resize canvas
        resize()

        // draw animation
        draw() 
        
        listening = false        
        move = false 

        // draw static things
        drawStatic()
    },
    on_finish: function(data) {
        window.removeEventListener('mousemove', mouseTrack) // stop event listener for mouse tracking after a trial is finished
    }
}       

// show fixation and test trials, to be added later to timeline
function show_test() {
    for (i = 1; i <= n_trial; i++) { 
        // fixation cross	
        h_tmp 	= height_distance_shuffled[i-1][0]     // ball height 
    
        var fixation_hori = {
            obj_type: 'line',
            x1: X_init_pos-7.5,
            y1: h_tmp - r_ball,
            x2: X_init_pos+7.5,
            y2: h_tmp - r_ball,       
            line_width: 3,
            line_color: 'black',
        }
         
        var fixation_verti = {
            obj_type: 'line',
            x1: X_init_pos,
            y1: h_tmp - r_ball - 7.5,
            x2: X_init_pos,
            y2: h_tmp - r_ball + 7.5,       
            line_width: 3,
            line_color: 'black', 
        }
    
        fixation_list = []
        fixation_list.push(fixation_hori)			
        fixation_list.push(fixation_verti)		
        
        var fixation = {
            type: 'psychophysics',
            stimuli: fixation_list,
            trial_duration: fixation_duration,
            background_color: 'white',
            choices: jsPsych.NO_KEYS,
        }
            
        timeline.push(fixation)	
        timeline.push(test)	
    }
}



//-------------------------------------------------------------------------
// Instructions and stuff
//-------------------------------------------------------------------------

// Browser check
var is_firefox = typeof InstallTrigger !== 'undefined';
var is_Chrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
var is_Safari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
var is_mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)  // true for mobile device


var mobile_warning = {
    data: {
        test_part: 'browser-check'
    },
    type: 'html-button-response',
    button_html: '<button class="jspsych-btn" style="width: 300px;">%choice%</button><br><br><br>',
    stimulus: '<p><strong>It seems you are using a mobile phone - this experiment will not work properly.</strong></p><p>Please try using a computer.</p>',
    choices: ['<strong>Exit<br>experiment</strong>'],
    post_trial_gap: post_trial_gap,
    on_finish: function (data){
        if (data.button_pressed == 0)
	    jsPsych.endExperiment('Experiment aborted.');
    },
};


var browser_warning = {
    data: {
        test_part: 'browser-check'
    },
    type: 'html-button-response',
    button_html: '<button class="jspsych-btn" style="width: 300px;">%choice%</button><br><br><br>',
    stimulus: '<p><strong>It seems you are not using Firefox, Chrome, Safari or a computer- this experiment will not work properly. Please use a computer and with one of the aforementionned browsers.</strong></p>',
    choices: ['<strong>Exit<br>experiment</strong>'],
    post_trial_gap: post_trial_gap,
    on_finish: function (data){
        if (data.button_pressed == 0)
	    jsPsych.endExperiment('Experiment aborted.');
    },
};


// generic message for instructions
const continue_msg 	= '(option to continue will appear after a short delay)';

let instr_continue = {				        // instruction continue button appears
    data: {test_part: 'instructions'},
    type: "html-button-response",
    stimulus: function(){
	    return jsPsych.data.get().last(1).values()[0].stimulus;
    },
	choices: ['Next'],
    post_trial_gap: post_trial_gap,
}

var welcome = {
    type: "html-button-response",
    data: {test_part: 'instructions'},
    stimulus: "<p>Welcome to the experiment. </p>"+ 
	    "<p></p>", 
    choices: ['Start']
};

var consentform = {
    type: "html-button-response",
    data: {test_part: 'instructions'},
	stimulus: 
		"<div id='text'><p>Please read the following agreement to participate.</p>"+
		"<h3>Description of the study:</h3>"+
		"<p>The purpose of the study is to understand visual perception.</p>"+
		"<h3>Risks, Benefits, and Confidentiality: </h3>"+
        "<p>There are no known risks. All of your responses will be held anonymously. Only the researchers "+
        "involved in this study and those responsible for research oversight will have access to the information you provide. Your data and information will be completely confidential.</p>"+
		"<p>You will receive a compensation, as is indicated on Prolific.</p>"+
		"<h3>Time Commitment: </h3>"+
		"<p>The study will take about 7 minutes. </p>"+
		"<h3>Voluntary Participation: </h3>"+
		"<p>Participation in this study is completely voluntary.</p>"+
		"<h3>Contact Information: </h3>"+
		"<p>If you have any questions or concerns about any aspect of the study, please feel free to contact dawei.bai@ens.fr.</p>"+
		"<p>If you agree with this consent form, click the button \'I agree\'.</p></div>",
	choices: ['I agree'],	
	post_trial_gap: post_trial_gap
};


// instructions
var instructions_0 = {
    type: "html-keyboard-response",
    data: {test_part: 'instructions'},
    stimulus: '<h1>Let&#39;s get ready...</h1>&nbsp;'+
		'<br>When the experiment begins, you will sometimes need to answer quickly by clicking with your mouse or touchpad.<br>'+
		'<br>Things you need to do to make sure everything works fine:<ul> '+
		'<li>Maximize your browser window and make sure you can comfortably watch the screen and use the mouse or the touchpad.</li>' +
		'<li>Close any performance demanding program, so your computer works fast enough.</li>' +
		'<li>Close any chat programs or phone, so as not to be interrupted.</li> '+
		'<li><strong>Be prepared to remain equally attentive and alert for the duration of the experiment</strong>:'+
		'<br>your data will only be useful to us if you stay focused throughout the entire study. It&#39;s quite short, so there is no need to take a break before the end.<br></li></ul>&nbsp;<div style="text-align: center;">'+
		'<em>Next: Instructions</em></div>',
    choices: jsPsych.NO_KEYS,
    trial_duration: instr_duration,
    prompt: continue_msg,
};

var instructions_1 = {
    type: "html-keyboard-response",
    data: {test_part: 'instructions'},
    stimulus: 
		"<h1>Instructions</h1>" +	
		"<p>In this experiment, you will see videos of a ball in motion. The ball will fall on a cliff, then roll over the cliff, like below.</p>" + 
		"<p>A blue curtain hangs to the right of the cliff. The curtain hides the falling ball from view, and it does not block the ball's trajectory in any way.</p>" +
        "<img src= 'img/instruction_figure_v3.jpg' style='width:700px'> "+
		"<p>Your job is to simply <strong>indicate with your mouse where the ball would come out below the curtain</strong>.</p>" +
		"<p>Our goal is to study your intuitions about physics, therefore you do not need to think carefully.</p>"+
		"<p>Instead, follow your intuitions and <strong>respond as quickly as possible</strong>. Also, there is no right or wrong answers.</p>"+
		"<p>&nbsp;</p>"+
		"<p>You will now go through a few training trials.</p>",
    choices: jsPsych.NO_KEYS,
    
    trial_duration: instr_duration,
    prompt: continue_msg,	  
};


var instructions_2 = {          // instructions after training
    type: "html-button-response",
    data: {test_part: 'instructions'},
    stimulus: 
	"<p>Great job!</p>" + 
	"<p>The real trials start in the next screen.</p>" + 
    "<p>Remember, you do not need to think carefully about each response. Instead, <strong>follow your intuitions and respond quickly</strong>.</p>" + 
	"<p>Please stay focused throughout the trials, which will only take about 4 minutes.</p>" + 
	"<p></p>",
	choices: ['Start the test', 'I did not understand, quickly take me through instructions & training again'],
    post_trial_gap: post_trial_gap,
};

var blank_screen = {          
    type: "html-keyboard-response",
    data: {test_part: 'blank'},
    choices: jsPsych.NO_KEYS,
    stimulus: "<p></p>",
    trial_duration : fixation_duration
};

var instructions_2_again = {          // instructions again
    type: "html-button-response",
    data: {test_part: 'instructions'},
    stimulus: 
    "<p>Now you surely know how it works. The real trials start in the next screen.</p>" + 
    "<p>Remember, You do not need to think carefully about each response. Instead, <strong>follow your intuitions and respond quickly</strong>.</p>" + 
    "<p>Please stay focused throughout the trials, which will only take about 4 minutes.</p>" + 
    "<p></p>",
    choices: ['Start the test'],
    post_trial_gap: post_trial_gap
};


// Attention questions
var question1 = {
    type: "html-button-response",
    data: {test_part: 'feedback'},
	stimulus: 
		"<p>Well done! We just have a few more questions: </p>"+
		"<p>Are the videos displayed smoothly?</p>",
	choices: ['Yes', 'No', 'Yes in the beginning, but they stutter towards the end', 'Yes overall, but they stutter occasionally'],	
	post_trial_gap: post_trial_gap
};

var question2 = {
	type: "html-button-response",
	data: {test_part: 'attention questions', correct_response: "2"},
	stimulus: 		
		"<p>What is the color of elephants?</p>",
	choices: ['Pink', 'Green', 'Grey'],	
	on_finish: function(data){
		if(data.button_pressed == data.correct_response){
			data.correct = true;
		} else {
			data.correct = false;
		}
	},
	post_trial_gap: post_trial_gap
};

var question3 = {
	type: "html-button-response",
	data: {test_part: 'attention questions', correct_response: "0"},
	stimulus: 
		"<p>Which continent is Canada located in?</p>",
	choices: ['North America', 'Asia', 'Europe'],	
	on_finish: function(data){
		if(data.button_pressed == data.correct_response){
			data.correct = true;
		} else {
			data.correct = false;
		}
	},
	post_trial_gap: post_trial_gap
};

var question4 = {
	type: "html-button-response",
	data: {test_part: 'attention questions', correct_response: "1"},
	stimulus: 
		"<p>How many states are there in the USA?</p>",
	choices: ['7', '50', '2000'],	
	on_finish: function(data){
		if(data.button_pressed == data.correct_response){
			data.correct = true;
		} else {
			data.correct = false;
		}
	},
	post_trial_gap: post_trial_gap
};


var prolificID = {
    type: "survey-text",
    questions: [
        {prompt: "What is your Prolific ID?", rows: 1, columns: 40}, 
      ],
};

// debrief, Prolific link
var debrief_block = {
    type: "html-keyboard-response",
    stimulus: function() {
        return "<p>Great job! You're done! Thank you for your participation.</p>" + 
        "<p>Please click <strong> <a href = 'https://app.prolific.co/submissions/complete?cc=1FA3B865'>here</a></strong> to be redirected to Prolific.</p>" +
        "<p>If the link doesn't work, please copy paste the address in your browser: https://app.prolific.co/submissions/complete?cc=1FA3B865.</p>"
    },
    choices: jsPsych.NO_KEYS,
};

//-------------------------------------------------------------------------
// Timeline
//-------------------------------------------------------------------------
if (is_mobile){
    timeline.push(mobile_warning);
}	

if (!((is_Chrome) || (is_firefox) || (is_Safari))){ //if it's neither chrome nor firefox nor safari
    timeline.push(browser_warning);
}	

if (!skip_welcome_consent){
    timeline.push(welcome)              
    timeline.push(prolificID);	
    timeline.push(consentform)          
    timeline.push(instructions_0, instr_continue)  	
}

if (!skip_instructions){
    timeline.push(instructions_1, instr_continue)       
}	




// training trials
if (!skip_training) {
    show_training()
    
    timeline.push(instructions_2) // add instruction after training
    
    var train_again = { // if needed, take pps through training again
        timeline: [instructions_1, instr_continue, training, blank_screen, training, instructions_2_again],
        conditional_function: function(){
            var data = jsPsych.data.get().last(1).values()[0];
            if(data.button_pressed == 1){ // if they want training again
                return true;
            } else {
                return false;
            }
        }
    }
    timeline.push(train_again)
}
    
show_test()


// attention questions
if (!skip_attention_questions){
	timeline.push(question1);									 
	timeline.push(question2);									
	timeline.push(question3);									
	timeline.push(question4);									
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


if (!skip_debrief){
	timeline.push(debrief_block);  						
};

jsPsych.init({      
    timeline: timeline,        
    // on_finish: function(){jsPsych.data.displayData();}
});