// The double ring illusion 
// experiment
// By Dawei Bai 9-11/2021	

var skip_welcome 		= true;
var skip_instructions 	= false;
var skip_practice 		= false;

const ProjName	 = "Double Ring Illusion"
const expVersion = "pilot 1"
const lengthExp = 3  // minutes

const 	ring_width   = 50,
	ring_thickness = 10,
	cross_length = 15,
	cross_width  = 4,
	pi 			 = Math.PI,

	N_Trial	 	 = 30,
	
	canvas_width  = 800,
	canvas_height = 600,

	ringPosX = canvas_width/2,
	ringPosY = canvas_height/2,

	ChoiceWidth		 = 300,
	ChoiceHeight	 = 176,
	
	choicePosX1		 = 0,	
	choicePosX2		 = canvas_width - ChoiceWidth,	
	
	choicePosY1		 = 0,
	choicePosY2		 = canvas_height - ChoiceHeight


const maskInterval 	= 1000
const optionsAppearAfter = 3000

let t_stopper, t1, t0, t_stopper2, t_stopper3

var conditionArray = [
	"sep",
	"overlap",
	"gapped",
]

var conditionArrayShuffled = jsPsych.randomization.repeat(conditionArray, N_Trial/3);

// resize canvas
function resize() {
	canvas.width = canvas_width;
	canvas.height = canvas_height;
	canvas2.width = canvas_width;
	canvas2.height = canvas_height;
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
	jsPsych.data.addProperties({subject: subjectId, proj_name: ProjName, exp_version: expVersion});
	


// end trial if click on one option
function endTrial(e) {  

	posCanvasX = e.x - (window.innerWidth-canvas_width)/2
	posCanvasY = e.y - (window.innerHeight-canvas_height)/2

	t_stopper3 = performance.now()
	

	if (t_stopper3 - t0 > optionsAppearAfter) { 
		rt = t_stopper3 - t0 - optionsAppearAfter
		if ((posCanvasY >= choicePosY1 && posCanvasY <= (choicePosY1 + ChoiceHeight)) && (posCanvasX >= choicePosX1 && posCanvasX <= (choicePosX1 + ChoiceWidth))) {
				document.removeEventListener('click', endTrial)
				cancelAnimationFrame(stopID)        
				choice = '1'
				jsPsych.data.write({rt: rt, response: choice})    
				jsPsych.finishTrial()
			
		} 
		
		if ((posCanvasY >= choicePosY1 && posCanvasY <= (choicePosY1 + ChoiceHeight)) && (posCanvasX >= choicePosX2 && posCanvasX <= (choicePosX2 + ChoiceWidth))) {
				document.removeEventListener('click', endTrial)
				cancelAnimationFrame(stopID)        
				choice = '2'
				
				jsPsych.data.write({rt: rt, response: choice})    
				jsPsych.finishTrial()
			} 

		if ((posCanvasY >= choicePosY2 && posCanvasY <= (choicePosY2 + ChoiceHeight)) && (posCanvasX >= choicePosX1 && posCanvasX <= (choicePosX1 + ChoiceWidth))) {
				document.removeEventListener('click', endTrial)
				cancelAnimationFrame(stopID)        
				choice = '3'

				jsPsych.data.write({rt: rt, response: choice})    
				jsPsych.finishTrial()
		} 

		if ((posCanvasY >= choicePosY2 && posCanvasY <= (choicePosY2 + ChoiceHeight)) && (posCanvasX >= choicePosX2 && posCanvasX <= (choicePosX2 + ChoiceWidth))) {
				document.removeEventListener('click', endTrial)
				cancelAnimationFrame(stopID)        
				choice = '4'

				jsPsych.data.write({rt: rt, response: choice})    
				jsPsych.finishTrial()
		}
	}		
}

function mouseTrack(c2) { // tracks mouse position
	return function executeOnEvent (e) {
		posCanvasX = e.x - (window.innerWidth-canvas_width)/2
		posCanvasY = e.y - (window.innerHeight-canvas_height)/2


		// draw black contour when mouse over
		t_stopper2 = performance.now()
		if (t_stopper2 - t0 > optionsAppearAfter) { // show choices after an interval
			lineWidth = 2
			c2.lineWidth = lineWidth

			c2.clearRect(choicePosX1-lineWidth, choicePosY1-lineWidth, ChoiceWidth+lineWidth*2, ChoiceHeight+lineWidth*2);
			if ((posCanvasY >= choicePosY1 && posCanvasY <= (choicePosY1 + ChoiceHeight)) && (posCanvasX >= choicePosX1 && posCanvasX <= (choicePosX1 + ChoiceWidth))) {
				c2.beginPath();
				c2.rect(choicePosX1, choicePosY1, ChoiceWidth, ChoiceHeight);
				c2.stroke();
				c2.closePath();
			} 
			
			c2.clearRect(choicePosX2-lineWidth, choicePosY1-lineWidth, ChoiceWidth+lineWidth*2, ChoiceHeight+lineWidth*2);
			if ((posCanvasY >= choicePosY1 && posCanvasY <= (choicePosY1 + ChoiceHeight)) && (posCanvasX >= choicePosX2 && posCanvasX <= (choicePosX2 + ChoiceWidth))) {
				c2.beginPath();
				c2.rect(choicePosX2, choicePosY1, ChoiceWidth, ChoiceHeight);
				c2.stroke();
				c2.closePath();
				} 
				
			c2.clearRect(choicePosX1-lineWidth, choicePosY2-lineWidth, ChoiceWidth+lineWidth*2, ChoiceHeight+lineWidth*2);
			if ((posCanvasY >= choicePosY2 && posCanvasY <= (choicePosY2 + ChoiceHeight)) && (posCanvasX >= choicePosX1 && posCanvasX <= (choicePosX1 + ChoiceWidth))) {
				c2.beginPath();
				c2.rect(choicePosX1, choicePosY2, ChoiceWidth, ChoiceHeight);
				c2.stroke();
				c2.closePath();
			} 

			c2.clearRect(choicePosX2-lineWidth, choicePosY2-lineWidth, ChoiceWidth+lineWidth*2, ChoiceHeight+lineWidth*2);
			if ((posCanvasY >= choicePosY2 && posCanvasY <= (choicePosY2 + ChoiceHeight)) && (posCanvasX >= choicePosX2 && posCanvasX <= (choicePosX2 + ChoiceWidth))) {
				c2.beginPath();
				c2.rect(choicePosX2, choicePosY2, ChoiceWidth, ChoiceHeight);
				c2.stroke();
				c2.closePath();
			}
		}	
	}
}


function drawCircle(c, drawX, drawY, width) {
	c.beginPath();
	c.ellipse(drawX, drawY, width, ring_width, 0, 0, 2 * Math.PI);
	c.stroke();
	c.closePath();
}


// option functions
// overlap options
function drawChoices_overlap_CounterClock (c, img, imageCounter, x, y) {
		if (imageCounter> 50) {
			imageCounter = imageCounter-50
		}
		img.onload = function() {
			c.clearRect(x, y, ChoiceWidth, ChoiceHeight);
			c.drawImage(img, x, y, ChoiceWidth, ChoiceHeight);
		}
		img.src = 'images/overlap00' + imageCounter +'.png'
}

function drawChoices_overlap_Clock (c, img, imageCounter, x, y) {
		if (imageCounter> 50) {
			imageCounter = imageCounter-50
		}
		img.onload = function() {
			c.clearRect(x, y, ChoiceWidth, ChoiceHeight);
			c.drawImage(img, x, y, ChoiceWidth, ChoiceHeight);
		}
		img.src = 'images/overlap00' + (51 - imageCounter) +'.png'
}

function drawChoices_overlap_bounce_1 (c, img, imageCounter, x, y) {
	if (imageCounter <= 50) {
		img.onload = function() {
			c.clearRect(x, y, ChoiceWidth, ChoiceHeight);
			c.drawImage(img, x, y, ChoiceWidth, ChoiceHeight);
		}
		img.src = 'images/overlap00' + imageCounter +'.png'
	} else {
		imageCounter = imageCounter - 50
		img.onload = function() {
			c.clearRect(x, y, ChoiceWidth, ChoiceHeight);
			c.drawImage(img, x, y, ChoiceWidth, ChoiceHeight);
		}
		img.src = 'images/overlap00' + (51-imageCounter) +'.png'
	}
}

function drawChoices_overlap_bounce_2 (c, img, imageCounter, x, y) {
	if (imageCounter <= 50) {
		img.onload = function() {
			c.clearRect(x, y, ChoiceWidth, ChoiceHeight);
			c.drawImage(img, x, y, ChoiceWidth, ChoiceHeight);
		}
		img.src = 'images/overlap00' + (51-imageCounter) +'.png'
	} else {
		imageCounter = imageCounter - 50
		img.onload = function() {
			c.clearRect(x, y, ChoiceWidth, ChoiceHeight);
			c.drawImage(img, x, y, ChoiceWidth, ChoiceHeight);
		}
		img.src = 'images/overlap00' + imageCounter +'.png'
	}
}

// sep options
function drawChoices_sep_CounterClock (c, img, imageCounter, x, y) {
	if (imageCounter> 50) {
		imageCounter = imageCounter-50
	}
	img.onload = function() {
		c.clearRect(x, y, ChoiceWidth, ChoiceHeight);
		// c.drawImage(img, 70,100,980,470, x, choicePosY, ChoiceWidth, 120);
		c.drawImage(img, x, y, ChoiceWidth, ChoiceHeight);

	}
	img.src = 'images/sep00' + imageCounter +'.png'
}

function drawChoices_sep_Clock (c, img, imageCounter, x, y) {
		if (imageCounter> 50) {
			imageCounter = imageCounter-50
		}
		img.onload = function() {
			c.clearRect(x, y, ChoiceWidth, ChoiceHeight);
			c.drawImage(img, x, y, ChoiceWidth, ChoiceHeight);
		}
		img.src = 'images/sep00' + (51 - imageCounter) +'.png'
}

function drawChoices_sep_bounce_1 (c, img, imageCounter, x, y) {
	if (imageCounter <= 50) {
		img.onload = function() {
			c.clearRect(x, y, ChoiceWidth, ChoiceHeight);
			c.drawImage(img, x, y, ChoiceWidth, ChoiceHeight);
		}
		img.src = 'images/sep00' + imageCounter +'.png'
	} else {
		imageCounter = imageCounter - 50
		img.onload = function() {
			c.clearRect(x, y, ChoiceWidth, ChoiceHeight);
			c.drawImage(img, x, y, ChoiceWidth, ChoiceHeight);
		}
		img.src = 'images/sep00' + (51-imageCounter) +'.png'
	}
}

function drawChoices_sep_bounce_2 (c, img, imageCounter, x, y) {
	if (imageCounter <= 50) {
		img.onload = function() {
			c.clearRect(x, y, ChoiceWidth, ChoiceHeight);
			c.drawImage(img, x, y, ChoiceWidth, ChoiceHeight);
		}
		img.src = 'images/sep00' + (51-imageCounter) +'.png'
	} else {
		imageCounter = imageCounter - 50
		img.onload = function() {
			c.clearRect(x, y, ChoiceWidth, ChoiceHeight);
			c.drawImage(img, x, y, ChoiceWidth, ChoiceHeight);
		}
		img.src = 'images/sep00' + imageCounter +'.png'
	}
}

// gapped options
function drawChoices_gapped_CounterClock (c, img, imageCounter, x, y) {
	if (imageCounter> 50) {
		imageCounter = imageCounter-50
	}
	img.onload = function() {
		c.clearRect(x, y, ChoiceWidth, ChoiceHeight);
		c.drawImage(img, x, y, ChoiceWidth, ChoiceHeight);
	}
	img.src = 'images/gapped00' + imageCounter +'.png'
}

function drawChoices_gapped_Clock (c, img, imageCounter, x, y) {
		if (imageCounter> 50) {
			imageCounter = imageCounter-50
		}
		img.onload = function() {
			c.clearRect(x, y, ChoiceWidth, ChoiceHeight);
			c.drawImage(img, x, y, ChoiceWidth, ChoiceHeight);
		}
		img.src = 'images/gapped00' + (51 - imageCounter) +'.png'
}

function drawChoices_gapped_bounce_1 (c, img, imageCounter, x, y) {
	if (imageCounter <= 50) {
		img.onload = function() {
			c.clearRect(x, y, ChoiceWidth, ChoiceHeight);
			c.drawImage(img, x, y, ChoiceWidth, ChoiceHeight);
		}
		img.src = 'images/gapped00' + imageCounter +'.png'
	} else {
		imageCounter = imageCounter - 50
		img.onload = function() {
			c.clearRect(x, y, ChoiceWidth, ChoiceHeight);
			c.drawImage(img, x, y, ChoiceWidth, ChoiceHeight);
		}
		img.src = 'images/gapped00' + (51-imageCounter) +'.png'
	}
}

function drawChoices_gapped_bounce_2 (c, img, imageCounter, x, y) {
	if (imageCounter <= 50) {
		img.onload = function() {
			c.clearRect(x, y, ChoiceWidth, ChoiceHeight);
			c.drawImage(img, x, y, ChoiceWidth, ChoiceHeight);
		}
		img.src = 'images/gapped00' + (51-imageCounter) +'.png'
	} else {
		imageCounter = imageCounter - 50
		img.onload = function() {
			c.clearRect(x, y, ChoiceWidth, ChoiceHeight);
			c.drawImage(img, x, y, ChoiceWidth, ChoiceHeight);
		}
		img.src = 'images/gapped00' + imageCounter +'.png'
	}
}


// single ring options
function drawChoices_single_CounterClock (c, img, imageCounter, x, y) {
	if (imageCounter> 50) {
		imageCounter = imageCounter-50
	}
	img.onload = function() {
		c.clearRect(x, y, ChoiceWidth, ChoiceHeight);
		c.drawImage(img, x, y, ChoiceWidth, ChoiceHeight);
	}
	img.src = 'images/single00' + imageCounter +'.png'
}

function drawChoices_single_Clock (c, img, imageCounter, x, y) {
		if (imageCounter> 50) {
			imageCounter = imageCounter-50
		}
		img.onload = function() {
			c.clearRect(x, y, ChoiceWidth, ChoiceHeight);
			c.drawImage(img, x, y, ChoiceWidth, ChoiceHeight);
		}
		img.src = 'images/single00' + (51 - imageCounter) +'.png'
}

function drawChoices_single_bounce_1 (c, img, imageCounter, x, y) {
	if (imageCounter <= 50) {
		img.onload = function() {
			c.clearRect(x, y, ChoiceWidth, ChoiceHeight);
			c.drawImage(img, x, y, ChoiceWidth, ChoiceHeight);
		}
		img.src = 'images/single00' + imageCounter +'.png'
	} else {
		imageCounter = imageCounter - 50
		img.onload = function() {
			c.clearRect(x, y, ChoiceWidth, ChoiceHeight);
			c.drawImage(img, x, y, ChoiceWidth, ChoiceHeight);
		}
		img.src = 'images/single00' + (51-imageCounter) +'.png'
	}
}

function drawChoices_single_bounce_2 (c, img, imageCounter, x, y) {
	if (imageCounter <= 50) {
		img.onload = function() {
			c.clearRect(x, y, ChoiceWidth, ChoiceHeight);
			c.drawImage(img, x, y, ChoiceWidth, ChoiceHeight);
		}
		img.src = 'images/single00' + (51-imageCounter) +'.png'
	} else {
		imageCounter = imageCounter - 50
		img.onload = function() {
			c.clearRect(x, y, ChoiceWidth, ChoiceHeight);
			c.drawImage(img, x, y, ChoiceWidth, ChoiceHeight);
		}
		img.src = 'images/single00' + imageCounter +'.png'
	}
}

function drawChoices(c, condition, imageCounter, isPractice) {

	let img  = new Image();  
	let img2 = new Image();  
	let img3 = new Image();  
	let img4 = new Image();

	if (isPractice) {
		drawChoices_single_CounterClock(c, img , imageCounter, choicePosX1, choicePosY1)
		drawChoices_single_Clock(		 c, img2, imageCounter, choicePosX2, choicePosY1)
		drawChoices_single_bounce_1(	 c, img3, imageCounter, choicePosX1, choicePosY2)
		drawChoices_single_bounce_2(	 c, img4, imageCounter, choicePosX2, choicePosY2)

	} else if (condition == 'overlap') {
		drawChoices_overlap_CounterClock(c, img , imageCounter, choicePosX1, choicePosY1)
		drawChoices_overlap_Clock(		 c, img2, imageCounter, choicePosX2, choicePosY1)
		drawChoices_overlap_bounce_1(	 c, img3, imageCounter, choicePosX1, choicePosY2)
		drawChoices_overlap_bounce_2(	 c, img4, imageCounter, choicePosX2, choicePosY2)
	} else if (condition == 'sep') {
		drawChoices_sep_CounterClock(c, img , imageCounter, choicePosX1, choicePosY1)
		drawChoices_sep_Clock(		 c, img2, imageCounter, choicePosX2, choicePosY1)
		drawChoices_sep_bounce_1(	 c, img3, imageCounter, choicePosX1, choicePosY2)
		drawChoices_sep_bounce_2(	 c, img4, imageCounter, choicePosX2, choicePosY2)
		
	} else {
		drawChoices_gapped_CounterClock(c, img , imageCounter, choicePosX1, choicePosY1)
		drawChoices_gapped_Clock(		c, img2, imageCounter, choicePosX2, choicePosY1)
		drawChoices_gapped_bounce_1(	c, img3, imageCounter, choicePosX1, choicePosY2)
		drawChoices_gapped_bounce_2(	c, img4, imageCounter, choicePosX2, choicePosY2)

	}

	if (imageCounter <= 100) {
		imageCounter += 1
	} else {
		imageCounter = 1
	}

}

var trialCounter = 0
// var imageCounter = 1

display = function(isPractice) {    
	t0 = performance.now()

	trialCounter = trialCounter + 1
	
	var canvas  = document.getElementById('canvas');
	var c 		= canvas.getContext('2d');
	var canvas2  = document.getElementById('canvas2');
	var c2 		= canvas2.getContext('2d');
	
	resize()
	
	function Ring(condition) {
		
		this.width  = ring_width
		this.angle  = 0
		this.vAngle = 2 * pi/100

		this.drawX = ringPosX
		this.drawY = ringPosY

		this.counter = 1

		this.framecounter = 0

		this.update = function() {
			
			this.angle = this.framecounter * this.vAngle
			
			this.framecounter +=1
			// this.angle += this.vAngle
			this.width = Math.abs(Math.cos(this.angle) * ring_width)
			

			if (this.width< 0.0001) {
				this.width = 0.0001
			}
					
			/////////// draw ///////////	
			t_stopper = performance.now()
	

			// draw choices after an interval
			if (t_stopper - t0 > optionsAppearAfter) { 
				drawChoices(c, condition, this.framecounter, isPractice)
			}
			
			// draw circles
			c.clearRect(this.drawX - 75 - ring_width - ring_thickness, this.drawY - ring_width - ring_thickness, 150 + 2* ring_width + 2 * ring_thickness, ring_width * 2 + ring_thickness*2)
			c.lineWidth = ring_thickness;
			c.fillStyle = 'black'
			if (isPractice) {
				// practice single circle
				drawCircle(c, this.drawX, this.drawY, this.width)
			} else if (condition == "sep") {
				drawCircle(c, this.drawX-75, this.drawY, this.width)
				drawCircle(c, this.drawX+75, this.drawY, this.width)
			} else if (condition == "overlap") {
				drawCircle(c, this.drawX-25, this.drawY, this.width)
				drawCircle(c, this.drawX+25, this.drawY, this.width)
			} else {
				drawCircle(c, this.drawX-25, this.drawY, this.width)
				
				// 3rd circle - right
				c.beginPath();
				c.ellipse(this.drawX+25, this.drawY, this.width, ring_width, 0, -0.25* Math.PI, 0.25 * Math.PI);
				c.stroke();
				c.closePath();
				
				c.beginPath();
				c.ellipse(this.drawX+25, this.drawY, this.width, ring_width, 0, 0.42 * Math.PI, 0.58 * Math.PI);
				c.stroke();
				c.closePath();
				
				c.beginPath();
				c.ellipse(this.drawX+25, this.drawY, this.width, ring_width, 0, 0.75 * Math.PI, 1.25 * Math.PI);
				c.stroke();
				c.closePath();
				
				c.beginPath();
				c.ellipse(this.drawX+25, this.drawY, this.width, ring_width, 0, 1.42 * Math.PI, 1.58 * Math.PI);
				c.stroke();
				c.closePath();
			}

			if (this.framecounter >= 100) {
				this.framecounter = 0
			}
		};
	}
	


	
	// Animation Loop
	function animate() {
		stopID = window.requestAnimationFrame(animate);
		
		ring.update();
		
        window.addEventListener('click', endTrial);     // start listening for mouse movement and clicks
	}



	window.addEventListener('mousemove', mouseTrack(c2));
	
	let ring
	ring = new Ring(conditionArrayShuffled[trialCounter-1])
	
	animate();		
	// var intervalID = setInterval(animate, 20);

}

displayMask = function() {    
	t0 = performance.now()

	var canvas  = document.getElementById('canvas');
	var c 		= canvas.getContext('2d');
	
	canvas.width = canvas_width;
	canvas.height = canvas_height;
	
	function Mask() {
		c.fillStyle = 'black'

		this.update = function() {
			c.clearRect(canvas_width/5, canvas_height*2/5, canvas_width*4/5, canvas_height*3/5);

			for (column = 15; column <= 35; column++ ) {
				for (row = 20; row <= 30; row++ ) {
					die = Math.random()
					if (die < 0.5) {
						c.fillRect((canvas_width/50) * column, (canvas_height/50)*row, canvas_width/50, canvas_height/50)
					}
				}
			}	
		}
	};

	
	let mask
	mask = new Mask()
	
	function animate() {
		stopID = window.requestAnimationFrame(animate);
		mask.update();
	}
	animate();
}




var practice_trial = {       
	type:       'html-keyboard-response',     
	data: {test_part: 'practice'},
	stimulus: 	 '<canvas id="canvas"></canvas>'+ 
				'<canvas id="canvas2"></canvas>' + '<p>How does the ring move? Choose the option that best depicts what you perceive.</p>'+ '<p>&nbsp;</p>'+'<p>&nbsp;</p>'+
				'<br>(Please attend <strong>globally</strong> to the scene in the center, instead of focusing on a specific spot.)',
	choices: jsPsych.NO_KEYS,
	on_load: function() {
		display(1)
	},

}


var showMask = {       
	type:       'html-keyboard-response',     
	data: {test_part: 'test'},
	stimulus: 	 '<canvas id="canvas"></canvas>',
	choices: jsPsych.NO_KEYS,
	on_load: function() {
		displayMask()
	},
	trial_duration: maskInterval,

}


var test_trial = {       
	type:       'html-keyboard-response',     
	data: {test_part: 'test'},
	stimulus: 	 '<canvas id="canvas"></canvas>'+ 
				'<canvas id="canvas2"></canvas>' ,
	choices: jsPsych.NO_KEYS,
	on_load: function() {
		display(0)
	},
}



// Instructions & stuff
var prolificID = {
	type: "survey-text",
	data: {test_part: 'ProlificID'},
    questions: [
        {prompt: "<h2>Welcome to the experiment!</h2> What is your Prolific ID?", rows: 1, columns: 40, required: true}, 
    ],
};

var consentform = {
	type: "html-button-response",
	data: {test_part: 'consent'},
	stimulus: 
		"<div style = 'width: 800px'>" +
		"<p>Please read the following agreement to participate.</p>"+
		"<h3>Description of the study:</h3>"+
		"<p>The purpose of the study is to understand visual perception.</p>"+
		"<h3>Risks, Benefits, and Confidentiality: </h3>"+
		"<p>There are no known risks. You will receive a compensation, as is indicated on Prolific. " +
		"All of your responses will be held anonymously. Your anonymized data may be published together with the study results.</p>"+
		"<h3>Time Commitment: </h3>"+
		"<p>The study will take about " + lengthExp + " minutes. </p>"+
		"<h3>Voluntary Participation: </h3>"+
		"<p>Participation in this study is completely voluntary.</p>"+
		"<h3>Contact Information: </h3>"+
		"<p>If you have any questions or concerns about any aspect of the study, please feel free to contact dawei.bai@ens.fr.</p>"+
		"<p>If you agree with this consent form, press the button \'I agree\'.</p>"+
		"</div>",
	choices: ['I agree'],	
	post_trial_gap: 100
};

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

var continue_msg 				= '(option to continue will appear after a short delay)';

var instructions_0 = {
    data: {test_part: 'instructions'},
    type: "html-keyboard-response",
    stimulus: '<h1>Let&#39;s get ready...</h1>&nbsp;'+
		'<br>When the experiment begins, you will sometimes need to answer quickly by clicking with your mouse.<br>'+
		'<br>Things you need to do to make sure everything works fine:<ul> '+
		'<li>Maximize your browser window and make sure you can comfortably watch the screen and use the mouse.</li>' +
		'<li>Close any performance demanding program, so your computer works fast enough.</li>' +
		'<li>Close any chat programs or phone, so as not to be interrupted.</li> '+
		'<li><strong>Be prepared to remain equally attentive and alert for the duration of the experiment, which will only last ' + lengthExp +' minutes</strong>:'+
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
	"<div style = 'width : 800px'> <h1>Instructions (1/2)</h1>" +
	"<p>&nbsp;</p>"+
	"<p>In this experiment, you will see animations. And you will be asked to indicate what you are seeing by choosing from four options.</p>"+
	"<p>You will now see an example.</p>"+
	"</div>",
    choices: jsPsych.NO_KEYS,
    trial_duration: 5000,
    prompt: continue_msg,
};

var instr_advance = {
    data: {test_part: 'instructions'},
    type: "html-keyboard-response",
    stimulus: function(){
		return jsPsych.data.get().last(1).values()[0].stimulus;
    },
    choices: ['space'],
    prompt: 'Press space to advance.',
    post_trial_gap: 100,
}

var instructions_2 = {
    data: {test_part: 'instructions'},	
	type: "html-keyboard-response",
	stimulus: 
	"<div style = 'width : 800px'> <h1>Instructions (2/2)</h1>" +
	"<p>&nbsp;</p>"+
	"<p>Well done! Now you understand how it works, the real trials will start in the next screen.</p>"+
	"<p>Remember to <strong>attend globally to the scene in the center</strong>, instead of focusing on one spot on the ring.</p>"+
	"<p>Do not overthink it: simply give your most intuitive response. <strong>There is no right or wrong response.</strong> We simply would like to know what you perceive.</p>"+
	"</div>",
    choices: jsPsych.NO_KEYS,
    trial_duration: 5000,
    prompt: continue_msg,
};



// debriefing 
var purposeQuestion = {
	type: "survey-text",
	data: {test_part: 'purpose'},
    questions: [
        {prompt: 		"<p>Well done! We just have a few more questions: </p>"+
		"<p>What do you think is the purpose of this experiment?</p>", rows: 3, columns: 40, required: true}, 
    ],
};

// Attention questions
var question0 = {
    type: "html-button-response",
    data: {test_part: 'feedback'},
	stimulus: 
		"<p>Are the videos displayed smoothly?</p>",
	choices: ['Yes', 'No', 'Yes overall, but they stutter occasionally'],	
	post_trial_gap: 100
};

var question1 = {
	type: "html-button-response",
	data: {test_part: 'attention', correct_response: "2"},
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
	data: {test_part: 'attention', correct_response: "0"},
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
	data: {test_part: 'attention', correct_response: "1"},
	stimulus: 
		"<p>How many states are there in the USA?</p>",
	choices: ['None', '50', '120'],	
	on_finish: function(data){
		if(data.button_pressed == data.correct_response){
			data.correct = '1';
		} else {
			data.correct = '0';
		}
	},
	post_trial_gap: 100
};



var debrief_block = {
	type: "html-keyboard-response",
	stimulus: function() {
		return "<p>Great job! You're done! Thank you for your participation.</p>"+
		"<p>Please click <strong> <a href = 'https://app.prolific.co/submissions/complete?cc=1FA3B865'>here</a></strong> to be redirected to Prolific.</p>" +
		"<p>If the link doesn't work, please copy paste the code '1FA3B865' on Prolific or go to the address: https://app.prolific.co/submissions/complete?cc=1FA3B865.</p>"	},
	choices: jsPsych.NO_KEYS,
};



/////// TIMELINE ////////
var timeline = []

if (!skip_welcome){
	timeline.push(prolificID);	
	timeline.push(consentform); 								// consent form
	timeline.push(instructions_0, instr_continue);				// instructions
}
if (!skip_instructions){
	// instructions
	timeline.push(instructions_1, instr_advance);				// instructions		
}

if (!skip_practice){
	timeline.push(practice_trial)
	timeline.push(instructions_2, instr_advance);				// instructions		
}

for (i = 0; i < N_Trial; i++){
	timeline.push(showMask, test_trial)
}

timeline.push(purposeQuestion);								
timeline.push(question0);									
timeline.push(question1);									
timeline.push(question2);									
timeline.push(question3);									

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



jsPsych.init({      
	timeline: timeline,        
});

