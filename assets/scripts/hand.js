/*
	Hand constructor
*/
function Hand(options) {
	if (!(this instanceof arguments.callee)) throw new Error("Please use 'new' operator when calling " + arguments.callee);
	
	options = options || {};
	var pri = {};
	var pub = this;
	
		pri.cards = [];
		pri.bet = options.bet || 0;
		
	pub.toString = function() {
		var r = "";
			r += (pri.cards.reduce(function(a,b) { return a += b.getDisplayName() + " " }, ""));	
			r += (pri.bet !== 0 ? "(" + pub.getBetTotal() + "$)" : "");	
			r += (pub.isBusted() ? " [BUST]" : "");	
		return r;
	}
	
	pub.cards = function() {
		return pri.cards;
	};
	
	pub.getHighestPossibilityUnder = function(max) {
		//This function is deeper than I thought initially. A+A+A+A+K = many possible totals
		
		var singleValuesSum = 0;
		var multiValued = [];
		
		pri.cards.forEach(function(card,i) {
			if(!card.isFaceDown()) {
				var val = card.getValue();
				if(val instanceof Array) {
					multiValued.push(val);
				} else {
					singleValuesSum += val;
				}
			}
		});
		
		//Get all possible combinations of our card values. (technically works for things other than Ace.. magic voodoo card that has 5 values? okay.)
		//Filter anything larger than our max to check, sort by size, and return the best match.
		if(multiValued.length > 0) {
			
			var r = 0;
			var ps = シ
					.twoDeeToDee(multiValued)
					.map(シ.sum)
					.map(function(a) { return a + singleValuesSum })
					.sort(function(a,b) { 
						return a - b; 
					});
				
				ps
					.forEach(function(v,i) {
						if(v <= max && v > r) r = v;
					});
					
				//We didn't find any matches that were smaller than our max, return the smallest one
				return r || ps[0];
				
		} else {
			//No multivalued cards. If only life was always this simple
			return singleValuesSum;
		}
		
	};
	
	pub.isBusted = function() {
		return pub.getCardTotal(21) > 21;
	};
	
	pub.getCardTotal = function() {
		//The Aces have two values make for exponential possibilities. Let's return the highest combo that isn't a bust
		return pub.getHighestPossibilityUnder(21);
		
	};
	
	pub.getBetTotal = function() {
		return pri.bet;
	};
	
	pub.addToBet = function(value) {
		return pri.bet += parseFloat(value);
	};
	
	pub.deductFromBet = function(value) {
		return pri.bet -= parseFloat(value);
	};
	
	pub.addCard = function(card) {
		pri.cards.push(card);
	};
	
	pub.drawFirstCard = function() {
		if(pri.cards.length === 0) return false;
		return pri.cards.shift();
	};
	
	pub.showAllCards = function() {
		for(var i = 0; i < pri.cards.length; i++) {
			pri.cards[i].flip(false);
		}
	};
	
	pub.containsFaceDownCards = function() {
		for(var i = 0; i < pri.cards.length; i++) {
			if(pri.cards[i].isFaceDown()) {
				return true;
			}
		}
	};
	
	pub.clearHand = function() {
		pri.cards.length = 0;
	};
	
	return pub;

}

