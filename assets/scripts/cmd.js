if(typeof シ === "undefined") throw new Error("shared.js is required");

//Add supporting styles to the DOM
シ.addTag('assets/styles/cmd.css');

function CommandLine(op) {
	if (!(this instanceof arguments.callee)) throw new Error("Please use 'new' operator when calling " + arguments.callee);
	
	    op  = op || {};
	var pub = this;
	var pri = {};
		
		pub.autoScroll           = (typeof op.autoScroll           === "boolean") ? op.autoScroll           : true;
		pub.allowNullInput       = (typeof op.allowNullInput       === "boolean") ? op.allowNullInput       : true;
		pub.inputCursorCharacter = (typeof op.inputCursorCharacter === "string" ) ? op.inputCursorCharacter : '>';
		pub.focusOnInit          = (typeof op.focusOnInit          === "boolean") ? op.focusOnInit          : true;
		pub.onEvent              = (シ.isFunction(op.onEvent)                    ) ? op.onEvent              : false;
		pub.mountPoint           = op.mountPoint;
	
		pub.inputHistory = [];
		pub.inputHistoryIndex = 0;
		
	if(typeof pub.mountPoint === "string") {
		//We've been provided a DOM element ID to mount on. We'll check to be sure below.
		pub.mountPoint = document.getElementById(pub.mountPoint);
	} else {
		pub.mountPoint = pub.mountPoint;
	}
	
	if(typeof pub.mountPoint === "object" && pub.mountPoint.nodeType === 1) {
		//We have a DOM element to mount on. Cool.
		pub.mountPoint = pub.mountPoint;
		
	} else {
		//The mount point we were provided doesn't exist, or is invalid, so we're going to use body
		
		if(document.body && document.body.nodeType !== 1) {
			throw new Error("document.body isn't defined... where are we..?");
		}
		pub.mountPoint = document.body;
		
	}
	
	/* Set up the DOM elements */
	
	  //Command Line host div
		pub.el_cmdBox = document.createElement("div");
		pub.el_cmdBox.className = "cmdBox";
		pub.mountPoint.appendChild(pub.el_cmdBox);
		
	  //Command Line Display div
		pub.el_Display = document.createElement("ul");
		pub.el_Display.className = "cmdDisplay";
		pub.el_cmdBox.appendChild(pub.el_Display);
		
	  //Command Line input
		pub.el_Input = document.createElement("input");
		pub.el_Input.className = "cmdInput";
		pub.el_cmdBox.appendChild(pub.el_Input);
		
		if(pub.focusOnInit) {
			pub.focusInput();
		}
		
		if(pub.onEvent) {
			pub.el_Input.addEventListener("focus", function() {
				pub.onEvent('focus')
			});
			pub.el_Input.addEventListener("blur", function() {
				pub.onEvent('blur')
			});
		}
		
	/* Set up interaction handlers */
	
	  //If we click anywhere in the cmd window, set the focus to the input
		pub.el_cmdBox.addEventListener("click", function() {
			pub.focusInput();
		});
		
	  //If we receive keypress events, handle them. Currently we just submit the value of input on [Enter]
		pub.el_Input.addEventListener("keydown", function(event) {
			switch(event.keyCode) {
				case 13: //[Enter]
					pub.lastInput = pub.el_Input.value.replace(/ /g, "\u00A0");
					pub.el_Input.value = "";
					
					pub.inputHistory.unshift(pub.lastInput);
					pub.inputHistoryIndex = 0;
					
					if(typeof op.onInput !== "undefined" && op.onInput.call) {
						op.onInput(pub.lastInput);
					} else {
						pub.print(pub.lastInput);
					}
					
				break;
				case 27: //[Esc]
					pub.el_Input.value = "";
					pub.el_Input.blur();
				break;
				case 38: //[Down Arrow]
					if(pub.inputHistoryIndex < pub.inputHistory.length-1)
					pub.el_Input.value = pub.inputHistory[pub.inputHistoryIndex++];
				break;
				case 40: //[Up Arrow]
					if(pub.inputHistoryIndex > 0)
					pub.el_Input.value = pub.inputHistory[pub.inputHistoryIndex--];
				break;
			}
		});
}

//Clears the console
CommandLine.prototype.cls = function() {
	while (this.el_Display.lastChild) {
		this.el_Display.removeChild(this.el_Display.lastChild);
	}
	this.el_Input.focus();
};

/**
 * Prints out supplied string(s) to simulated console.
 * @param {Object|String} input 
 * @return {Number} sum
 */
CommandLine.prototype.print = function(input) {
	//If we're passed an array of strings, let's get recursive
	if(input instanceof Array) {
		for(var i = 0; i < input.length; i++) {
			this.print(input[i]);
		}
	} else if(typeof input === "string") {
		
		var el_NewLine = document.createElement("li");
		var el_NewLineText = document.createTextNode(input.replace(/\s/g,'\u00A0'));

		el_NewLine.appendChild(el_NewLineText);
		this.el_Display.appendChild(el_NewLine);
		
		if(this.autoScroll === true) {
			this.scrollToBottom();
		}
	}
	
};

CommandLine.prototype.focusInput = function() {
	this.el_Input.focus();
};
CommandLine.prototype.scrollToBottom = function(s_Direction) {
	this.el_cmdBox.scrollTop = this.el_cmdBox.scrollHeight;
	this.el_Display.scrollTop = this.el_Display.scrollHeight;
};
