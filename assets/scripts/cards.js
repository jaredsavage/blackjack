/*
	Card constructor
*/
function Card(options) {
	if (!(this instanceof arguments.callee)) throw new Error("Please use 'new' operator when calling " + arguments.callee);
	
	options = options || {};
	var pub = this;
	var pri = {};
	
	pri.index    = options.index;
	pri.value    = options.value;
	pri.suit     = options.suit;
	pri.facedown = false;
	
	pub.getSymbol = function() {
		return ['A','2','3','4','5','6','7','8','9','J','Q','K'][pri.index];
	};
	pub.getValue = function() {
		return pri.value;
	};
	pub.getSuit = function() {
		return ['♠','♣','♥','♦'][pri.suit];
	};
	pub.getDisplayName = function() {
		return pri.facedown ? "[ § ]" : "[" + pub.getSymbol() + " " + pub.getSuit() + "]";
	};
	pub.isFaceDown = function() {
		return pri.facedown;
	}
	pub.flip = function(facedown) {
		pri.facedown = typeof facedown !== "undefined" ? facedown : !pri.facedown;
	}
	
}

/*
	Deck constructor
*/
function Deck(options) {
	if (!(this instanceof arguments.callee)) throw new Error("Please use 'new' operator when calling " + arguments.callee); 
	
	options = options || {};
	var pub = this;
	var pri = {};
	
	pri.shuffled = typeof options.shuffled === "boolean" ? options.shuffled : true;
	pri.deckCount = typeof options.deckCount === "number" ? options.deckCount : 1;
	pri.cards = [];

	//Generate the cards
	for(var h = 0; h < pri.deckCount; h++) { //Decks
		for(var i = 0; i < 4; i++) { 		 //Suits
			for(var j = 0; j < 12; j++) {	 //Cards
				
				var card = new Card({
					index: j,
					value: j === 0 ? [1,11] : (j > 9 ? 10 : j+1), //Ace is worth either 1, or 11. Face cards are worth 10.
					suit: i
				});
				
				pri.cards.push(card);
				
			}
		}
	}
	
	pub.addCard = function(card) {
		pri.cards.push(card);
	}
	
	pub.drawCard = function(options) {
		var card = pri.cards.shift();
		if(options && options.flipped === true) {
			card.flip();
		}
		return card;
	};
	
	//This should probably be faster / smarter.. thinking assign Math.random() as an attribute to each element, then sort the array on that.
	pub.shuffleDeck = function() {
		var tempDeck = [];
		
		var cardCount = pri.cards.length;
		while(pri.cards.length > 0) {
			var randomPosition = Math.floor(Math.random() * cardCount);
			if(typeof tempDeck[randomPosition] === "undefined") {
				tempDeck[randomPosition] = pri.cards.pop();
			}
		}
		
		pri.cards = tempDeck;
		
	};
	
	if(pri.shuffled) {
		pub.shuffleDeck();
	}
	
}