/**
 * Little helpers
 */
window.シ = window.シ || {
	/**
	 * Used for manipulating Classes on DOM Elements
	 * @param {object}  node       -- DOM element to append class to
	 * @param {string}  className  -- string of classname to append
	 * @param {boolean} remove     -- whether to add/remove classname
	 */
	classNameChange: function(node, className, add) {
		//WIP, not used yet
		
		if(arguments.length > 3){
			throw new Error("シ.classNameChange() requires 3 params")
		}
			
		if(node && node.nodeType !== 1) {
			throw new Error("シ.classNameChange() param1 must be a DOM element");
		}
			
		if(typeof className !== 'string' || className === '' || className === ' ') {
			throw new Error("シ.classNameChange() param2 must be the className string");
		}
			
		var curClassName   = node.className;
		var alreadyDefined = curClassName.indexOf(className) !== -1;
		
		//Class is not already defined.
		if(add && !alreadyDefined) {
			node.setAttribute('class', curClassName + " " + className );
		} else if(!add && alreadyDefined) {
			node.setAttribute('class', curClassName.replace(" " + className , "") );
		}
		
	},
	/**
	 * Used for adding Classes to DOM Elements
	 * @param {object} node       -- DOM element to append class to
	 * @param {string} className  -- string of classname to append
	 */
	addClass: function() {
		return シ.classNameChange.apply(this, arguments.push(true));
	},
	/**
	 * Used for adding Classes to DOM Elements
	 * @param {object} node       -- DOM element to append class to
	 * @param {string} className  -- string of classname to append
	 */
	removeClass: function() {
		return シ.classNameChange.apply(this, arguments.push(false));
	},
	/**
	 * Provided a url, generates the appropriate tag and appends to head.
	 * Used for bootstrap
	 * @param {string}   url 
	 * @param {function} callback 
	 */
	addTag: function(url, onload) {
		
		var fileType = url.split(".").pop();
		
		switch(fileType) {
			case 'jpg':
			case 'png':
			case 'gif':
				var img           = new Image();
					img.src 	  = url;
					img.onload = onload;
			break;
			case 'js':
				var script = document.createElement('script'); 
					script.setAttribute('type', 'text/javascript');
					script.onload = onload;
					script.setAttribute('src', url);
					document.head.appendChild(script);
			break;
			case 'css':
				var style = document.createElement('link'); 
					style.setAttribute('rel', 'stylesheet');
					style.setAttribute('type', 'text/css');
					style.setAttribute('href', url);
					document.head.appendChild(style);
			break;
		}
	},
	/**
	 * Wrapper to simplify DOM node creation
	 * @param  {string} nodeType
	 * @param  {object} attr -- array of key:value pairs, assigned to the new node
	 * @param  {object} optional dstParent -- if supplied, we append the new element directly
	 * @return {object} returns the new DOM element
	 */
	newNode: function(nodeType, attr, dstParent) {
		//WIP, not used yet
	
		if(arguments.length === 0) throw new Error("newNode can't be called without any arguments");

		var el = document.createElement(nodeType);
			Object.keys(attr).forEach(function(k) {
				el.setAttribute(k, attr[k]);
			});
		
		if(arguments.length == 3 && シ.isFunction(dstParent.appendChild)) {
			dstParent.appendChild(el);
		}
		
		return el;
		
	},
	/**
	 * Wrapper to simplify DOM node attribute assignment
	 * @param  {object} node (DOM element)
	 * @param  {object} optional dstParent -- if supplied, we append the new element directly
	 * @return {object} returns the new DOM element
	 */
	addAttributesToNode: function(node, attr) {
		//WIP, not used yet
		
		if(arguments.length === 0) throw new Error("addAttributesToNode can't be called without any arguments");
		
			Object.keys(attr).forEach(function(k) {
				el.setAttribute(k, attr[k]);
			});
		
		if(arguments.length == 3 && シ.isFunction(dstParent.appendChild)) {
			dstParent.appendChild(el);
		}
		
		return el;
		
	},	
	/**
	 * Provided an array of URLs, appends them to head. If an element is an array, the elements of that array are loaded in parallel
	 * Used for bootstrap
	 * @param {string[[]]} input 
	 * @param {boolean}    showLoader 
	 */
	load: function(input, showLoader) {
		
		//Todo: clean this up, use the node creation helpers once they're ready
		if(showLoader) {
			
			var loaderBox = document.createElement("div");
				loaderBox.className = "loaderBox";
				
			var loaderBoxInner = document.createElement("div");
				loaderBoxInner.className = "loaderBoxInner";
				
			var loaderBoxSpinner = document.createElement("div");
				loaderBoxSpinner.className = "loaderBoxSpinner";
				loaderBoxInner.appendChild(loaderBoxSpinner);
				
			var loaderBoxSpinner = document.createElement("div");
				loaderBoxSpinner.className = "loaderBoxSpinner";
				loaderBoxInner.appendChild(loaderBoxSpinner);
				
				loaderBox.appendChild(loaderBoxInner);
				document.body.appendChild(loaderBox);
				
		}

		var itemsToLoad = 0;
		var loadingComplete = false;
		function innerLoad(input2) {
			
			if(input2.length === 0) {
				return false;
			}
			
			var r = input2.shift();
			(r instanceof Array ? r : [r])
				.forEach(function(res) {
					itemsToLoad++;
					シ.addTag(res, function() {
						
						itemsToLoad--;
						
						if(showLoader) {
							var resName = (res.indexOf("/") ? res.split("/").pop() : res);
							loaderBoxInner.appendChild(document.createTextNode("loaded " + resName));
							loaderBoxInner.appendChild(document.createElement("br"));
						}
						
						if(itemsToLoad === 0 && !loadingComplete) {
							loadingComplete = true;
							loaderBoxInner.style.opacity = 0;
							loaderBox.style.opacity = 0;
							loaderBox.style.pointerEvents = 'none';
							setTimeout(function() {
								document.body.removeChild(loaderBox);
							},5000)
						}
						
						innerLoad(input2); 
					});
				})
		}
		
		innerLoad(input);

	},
	/**
	 * Returns whether or not the element is a function
	 * Source: Based on underscore's way of doing it
	 * @param  {object} obj 
	 * @return {boolean}
	 */
	isFunction: function(obj) {
	  return !!(obj && obj.constructor && obj.call && obj.apply);
	},
	
	/**
	 * Turns an Array of Arrays into a flat list of all possible combinations.
	 * Used for calculating all of the Ace*Ace*Ace*King possible combinations
	 * Source: Based one a comment on SO #15298912, modified for use here
	 * @param  {number[[]]} inputArray 
	 * @return {boolean}
	 */
	twoDeeToDee: function(inArr) {
		
		var r = []
		var max = inArr.length-1;
		
		function helper(arr, i) {
			for (var j=0; j < inArr[i].length; j++) {
				var a = arr.slice(0);
				a.push(inArr[i][j]);
				if (i == max) {
					r.push(a);
				} else {
					helper(a, i+1);
				}
			}
		}
		
		helper([], 0);
		
		return r;
	},
	
	/**
	 * Adds the numbers in an array
	 * @param {number[]} inArr 
	 * @return {number}
	 */
	sum: function(inArr) {
		return inArr.reduce(function(a,b) {
			return a + b;
		},0);
	},
	
	/**
	 * Wraps a supplied string or array of strings with a pretty border. 
	 * Used for that old school console application feel.
	 * @param  {string|string[]} input 
	 * @param  {number}          style -- Style of frame
	 * @return {string[]}
	 */
	frameText : function(input, style) {
		
		if(typeof input === 'undefined') return '';
		if(!(input instanceof Array)) input = [input];
		if(typeof style !== 'number') style = 0;
		
		//Which line is our longest? that's the size of our box.
		var longestLineLen = 0
		input.forEach(function(v) {
			if(longestLineLen < v.length) longestLineLen = v.length;
		})
		
		//Used to generate a bar of characters
		function charBar(inChar, len) {
			return new Array(len).join(inChar);
		}
		
		//Frame styles.. should probably define these elsewhere so we're not being wasteful
		var frames = [
			['╔','═','╗','║',' ','║','╚','═','╝'],
			['┌','─','┐','│',' ','│','└','─','┘']
		];
		
		//Generate the border.. this is a bit of a mess, but it does what it needs to.
		var r = [];
		r.push(frames[style][0] + charBar(frames[style][1],longestLineLen + 3) + frames[style][2]);
		input.forEach(function(v) {
			r.push(frames[style][3] + " " + v + charBar(frames[style][4],((longestLineLen + 1)-v.length)) + " " + frames[style][5]);
		});
		r.push(frames[style][6] + charBar(frames[style][7],longestLineLen + 3) + frames[style][8]);
				
		return r;
		
	}
}