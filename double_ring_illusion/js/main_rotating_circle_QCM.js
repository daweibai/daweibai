// The double ring illusion 
// experiment
// By Dawei Bai 9-10/2021	




const 	ring_width   = 50,
	cross_length = 15,
	cross_width  = 4,
	pi 			 = Math.PI,

	n_training	 = 40,
	n_trials	 = 65,
	
	canvas_width = 800,
	canvas_height = 600,

	ChoiceWidth		 = 120,
	ChoiceHeight	 = 106,
	choicePosX		 = canvas_width/5 - ChoiceWidth/2,
	choicePosY		 = 420;

const mask_interval = 3000

	let t_stopper, t1, t0, t_stopper2, t_stopper3


// Utility Functions
function randomIntFromRange(min,max) {
	return Math.random() * (max - min) + min;
}

// resize canvas
function resize() {
	canvas.width = canvas_width;
	canvas.height = canvas_height;
	canvas2.width = canvas_width;
	canvas2.height = canvas_height;
}

// end trial if click on one option
function endTrial(e) {  

	posCanvasX = e.x - (window.innerWidth-canvas_width)/2
	posCanvasY = e.y - (window.innerHeight-canvas_height)/2

	t_stopper3 = performance.now()

	if (t_stopper3 - t0 > mask_interval) { 
		if (posCanvasY >= choicePosY && posCanvasY <= (choicePosY + ChoiceHeight)) {
			if (posCanvasX >= choicePosX && posCanvasX <= (choicePosX + ChoiceWidth)) {
				console.log('1')
				document.removeEventListener('click', endTrial)
				cancelAnimationFrame(stopID)        
			
				jsPsych.finishTrial()
			} else if (posCanvasX >= choicePosX+ canvas_width/5 && posCanvasX <= (choicePosX + canvas_width/5 + ChoiceWidth)) {
				console.log('2')
				document.removeEventListener('click', endTrial)
				cancelAnimationFrame(stopID)        
			
				jsPsych.finishTrial()
				
			} else if (posCanvasX >= choicePosX+ canvas_width/5 * 2 && posCanvasX <= (choicePosX + canvas_width/5 * 2 +ChoiceWidth)) {
				console.log('3')
				document.removeEventListener('click', endTrial)
				cancelAnimationFrame(stopID)        
			
				jsPsych.finishTrial()
				
			} else if (posCanvasX >= choicePosX+ canvas_width/5 * 3 && posCanvasX <= (choicePosX + canvas_width/5 * 3 + ChoiceWidth)) {
				console.log('4')
				document.removeEventListener('click', endTrial)
				cancelAnimationFrame(stopID)        
			
				jsPsych.finishTrial()

			}
		}
	}	

	
}

function mouseTrack(e) { // tracks mouse position
	posCanvasX = e.x - (window.innerWidth-canvas_width)/2
	posCanvasY = e.y - (window.innerHeight-canvas_height)/2
	var canvas2  = document.getElementById('canvas2');
	var c2 		= canvas2.getContext('2d');

	// draw black contour when mouse over
	t_stopper2 = performance.now()
	if (t_stopper2 - t0 > mask_interval) { // show choices after an interval
		c2.clearRect(0, choicePosY-2, canvas_width, ChoiceHeight+5);
		if (posCanvasY >= choicePosY && posCanvasY <= (choicePosY + ChoiceHeight)) {
			c2.lineWidth = 2
			if (posCanvasX >= choicePosX && posCanvasX <= (choicePosX + ChoiceWidth)) {
				c2.beginPath();
				c2.rect(choicePosX, choicePosY, ChoiceWidth, ChoiceHeight);
				c2.stroke();
				c2.closePath();
			} else if (posCanvasX >= choicePosX+ canvas_width/5 && posCanvasX <= (choicePosX + canvas_width/5 + ChoiceWidth)) {
				c2.beginPath();
				c2.rect(choicePosX + canvas_width/5, choicePosY, ChoiceWidth, ChoiceHeight);
				c2.stroke();
				c2.closePath();
			} else if (posCanvasX >= choicePosX+ canvas_width/5 * 2 && posCanvasX <= (choicePosX + canvas_width/5 * 2 +ChoiceWidth)) {
				c2.beginPath();
				c2.rect(choicePosX+2*canvas_width/5, choicePosY, ChoiceWidth, ChoiceHeight);
				c2.stroke();
				c2.closePath();
			} else if (posCanvasX >= choicePosX+ canvas_width/5 * 3 && posCanvasX <= (choicePosX + canvas_width/5 * 3 + ChoiceWidth)) {
				c2.beginPath();
				c2.rect(choicePosX+3*canvas_width/5, choicePosY, ChoiceWidth, ChoiceHeight);
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
let leftToRight = 1  

function drawChoices(c, x, y, width, height, imageCounter) {
	let img = new Image();  
	let img2 = new Image();  
	let img3 = new Image();  
	let img4 = new Image();
	if (imageCounter <= 50) {
		// choice 1
		img.onload = function() {
			c.drawImage(img, x, y, width, height);
		}
		img.src = 'images/ring' + imageCounter +'.jpg'
		
		// choice 2
		img2.onload = function() {
			c.drawImage(img2, x+canvas_width/5, y, width, height);
		}
		img2.src = 'images/ring' + (51 - imageCounter) +'.jpg'
		
		// choice 3
		if (imageCounter >49) {
			leftToRight = leftToRight * (-1)
		}
		if (leftToRight == 1) {
			img3.onload = function() {
				c.drawImage(img3, x+canvas_width/5*2, y, width, height);
			}
			img3.src = 'images/ring' + imageCounter +'.jpg'
		} else {
			img3.onload = function() {
				c.drawImage(img3, x+canvas_width/5*2, y, width, height);
			}
			img3.src = 'images/ring' + (51-imageCounter) +'.jpg'
		}
		
		// choice 4
		if (leftToRight == 1) {
			img4.onload = function() {
				c.drawImage(img4, x+canvas_width/5*3, y, width, height);
			}
			img4.src = 'images/ring' + (51-imageCounter) +'.jpg'
		} else {
			img4.onload = function() {
				c.drawImage(img4, x+canvas_width/5*3, y, width, height);
			}
			img4.src = 'images/ring' + imageCounter +'.jpg'
		}

		imageCounter += 1
	} else {
		imageCounter = 1
	}

}



var trialCounter = 0
// var imageCounter = 1

display = function() {    
	t0 = performance.now()

	trialCounter = trialCounter + 1
	
	var canvas  = document.getElementById('canvas');
	var c 		= canvas.getContext('2d');
	
	resize()
	

	function Ball() {
		
		this.width  = ring_width
		this.angle  = 0
		this.vAngle = 2 * pi/100

		this.x = canvas_width/2
		this.y = 150

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
			

            this.drawX = this.x;
            this.drawY = this.y;
			
			
			// draw

			// c.font = '23px serif';
			// c.fillStyle = "black";
			// c.fillText('How do the rings move?', 280, 300)
			
			t_stopper = performance.now()
			if (t_stopper - t0 > mask_interval) { // show choices after an interval
				drawChoices(c, choicePosX, choicePosY, ChoiceWidth, ChoiceHeight, this.framecounter)
			}	


				
			if (this.framecounter >= 50) {
				this.framecounter = 0
			}
			
			// draw circles
			c.lineWidth = 10;
			drawCircle(c, this.drawX-25, this.drawY, this.width)
			drawCircle(c, this.drawX+25, this.drawY, this.width)


		};


	}
	


	
	// Animation Loop
	function animate() {
		stopID = window.requestAnimationFrame(animate);
		
		c.clearRect(0, 0, canvas.width, canvas.height/2+10);
		
		ball.update();
		
        window.addEventListener('click', endTrial);     // start listening for mouse movement and clicks
		
	}

	window.addEventListener('mousemove', mouseTrack);
	


	let ball
	ball = new Ball()
	
	animate();

	// c.beginPath();
	// c.rect(0, canvas_height/2, canvas_width, canvas_height/2);
	// c.fill()
	// c.stroke();
	// c.closePath();
}



var training_trial = {       
	type:       'html-keyboard-response',     
	stimulus: 	 '<canvas id="canvas"></canvas>'+ 
				'<canvas id="canvas2"></canvas>' + '<p>How do the rings move?</p>',
	choices: jsPsych.NO_KEYS,
	on_load: function() {
		display()
	},
}


var timeline = []


for (i = 0; i < n_training; i++){
	timeline.push(training_trial)
}


jsPsych.init({      
	timeline: timeline,        
});

