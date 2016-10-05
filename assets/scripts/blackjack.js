/*
	BlackJack constructor
*/
function BlackJack(options) {
	if (!(this instanceof arguments.callee)) throw new Error("Please use 'new' operator when calling " + arguments.callee);
	
	options = options || {};
	var pub = this;
	var pri = {};
	
	//Player wallet must be provided
	if (!(options.playerWallet instanceof Wallet)) throw new Error("BlackJack must be initialized with a player wallet");
	
	pri.defaultBet   = options.defaultBet || 10;
	pri.onEvent      = options.onEvent;
	pri.playerWallet = options.playerWallet;
	pri.deckCount    = options.deckCount || 6;
	pri.deck         = new Deck({deckCount: pri.deckCount});
	pri.discards     = new Deck({deckCount: 0});
	pri.dealerHand   = new Hand();
	pri.hands	     = [];
	
	/**
	 * Gets the total of the player's current bet
	 * @return {boolean} 
	 */
	pri.getCurrentBet = function() {
		return pri.hands.reduce(function(a,b) {
			return a + b.getBetTotal();
		}, 0);
	}

	/**
	 * Gets player's best hand's value
	 * @return {number} 
	 */
	pri.getPlayersBestHandTotal = function() {
		var bestHandTotal = 0;
		for(var i = 0; i < pri.hands.length; i++) {
			var handTotal = pri.hands[i].getCardTotal();
			bestHandTotal = handTotal > bestHandTotal ? handTotal : bestHandTotal;
		}
		return bestHandTotal;
	}
	
	/**
	 * Returns whether the player is winning or not
	 * @return {boolean} 
	 */
	 pri.isPlayerWinning = function() {
		var dealerTotal = pri.dealerHand.getCardTotal();
		var playerTotal = pri.getPlayersBestHandTotal();
		
		if(playerTotal > 21  || dealerTotal === 21) return false;
		if(playerTotal <= 21 && dealerTotal > 21) return true;
		return playerTotal > dealerTotal;
	}
	
	/**
	 * Gets whether the player has any hands which are not busted
	 * @return {boolean} 
	 */
	pri.playerHasActiveHands = function() {
		return pri.hands.filter(function(hand) {
			return !(hand.isBusted());
		}).length !== 0;
	}
	
	/**
	 * Gets whether the game has ended or not
	 * @return {boolean} 
	 */
	pri.gameIsActive = function() {
		return pri.playerHasActiveHands() && !pri.dealerHand.isBusted() && pri.dealerHand.getCardTotal() !== 21;
	}
	
	pri.actions = {
		check : function() {
			
			var dealerTotal = pri.dealerHand.getCardTotal();
			
			if(!pri.playerHasActiveHands() || dealerTotal === 21) {
				pri.onEvent('lost', pri.state, シ.frameText(["Game over. House wins","[ENTER] for New Game"]));
				return false;
			}
			
			if(pri.dealerHand.isBusted()) {
				pri.onEvent('won', pri.state, シ.frameText(["House busted at "+dealerTotal+", you won "+ pri.getCurrentBet() +"$","     [ENTER] for New Game."]));
				pri.playerWallet.addToBalance(pri.getCurrentBet()*2);
			}
			
			return true;
			
		},
		dealerTurn : function() {
			//Ideally, I'd treat the dealer much like the player, and have a single set of functions that acts on either. 
			//Live and learn. For now, this advanced AI will do the trick.
			
			pri.dealerHand.showAllCards();
			
			//Very strong AI.	
			if(pri.isPlayerWinning()) {
				
				pri.onEvent('dealerTurn', pri.state, "Dealer is making a move..");
			
				//Draw card
				var card = pri.deck.drawCard();
				pri.dealerHand.addCard(card);
			}
			
		},
		showTable: function() {
			
			var msg = [
				"Dealer",
				"" + String(pri.dealerHand),
				"",
				"Player ("+ pri.playerWallet.getBalance() + "$)"
			];
			for(var i = 0; i < pri.hands.length; i++) {
				msg.push(String(pri.hands[i]));
			}
			pri.onEvent('showTable', pri.state, シ.frameText(msg,1));
			
		}
	}
	
	pub.actions = {
		deal: function() {
			
			if(pri.gameIsActive()) return false; //Already have an active game
			
			pri.dealerHand.clearHand();
			pri.hands.length = 0;
			
			//Make sure the player has enough cash to play
			var playerBalance = pri.playerWallet.getBalance();
			if(playerBalance < pri.defaultBet) {
				pri.onEvent('error', pri.state, "Your balance of ("+playerBalance+"$) is too low to play. The required bet is "+ pri.defaultBet +"$");
				return false;
			}
			
			pri.playerWallet.deductFromBalance(pri.defaultBet);
			pri.hands = [new Hand({bet: pri.defaultBet})];
			
			pri.state = {
				hasPlayed : false
			};
			
			pri.onEvent('deal', pri.state, シ.frameText("New Game, dealing cards"));
			
			pri.hands[0].addCard(pri.deck.drawCard());
			pri.dealerHand.addCard(pri.deck.drawCard({flipped: true}));
			
			pri.hands[0].addCard(pri.deck.drawCard());
			pri.dealerHand.addCard(pri.deck.drawCard());
			
			pri.actions.showTable();
			pri.actions.check();
			
		},
		hit: function() {
			
			if(!pri.gameIsActive()) return false; //Need an active game
			
			pri.state.hasPlayed = true;
			
			for(var i = 0; i < pri.hands.length; i++) {
				var card = pri.deck.drawCard();
				pri.hands[i].addCard(card);
			}
			
			pri.onEvent('hit', pri.state, "Hitting..");
			
			pri.actions.dealerTurn();
			pri.actions.showTable();
			pri.actions.check();
			
		},
		stand: function() {
			
			if(!pri.gameIsActive()) return false; //Need an active game
			
			pri.onEvent('stand', pri.state, "Standing..");
			
			pri.actions.dealerTurn();
			pri.actions.showTable();
			pri.actions.check();
			pri.onEvent('stand', pri.state);
			
		},
		doubleDown: function() {
			
			if(!pri.gameIsActive()) return false; //Need an active game
			
			var moneyRequiredForBet = pri.hands.reduce(function(a,b) {
				return a + b.getBetTotal();
			}, 0);
			
			if(moneyRequiredForBet < pri.playerWallet.getBalance()) {
				//We've got the money, deduct from player balance and hit
				pri.playerWallet.deductFromBalance(moneyRequiredForBet);
				pri.hands.forEach(function(hand) {
					hand.addToBet(hand.getBetTotal());
				})
				pri.onEvent('doubleDown', pri.state, "Doubled down!");
				pub.actions.hit();
				
			} else {
				pri.onEvent('message', pri.state, "You don't have enough money to double down...");
			}
			
		},
		split: function() {
			
			if(!pri.gameIsActive()) return false; //Need an active game
			
			if(pri.hands.length === 1 && pri.hands[0].cards()[0].getValue() === pri.hands[0].cards()[1].getValue()) {
			  pri.hands.push(new Hand());
			  
			  var betSplitAmount = (pri.hands[0].getBetTotal() / 2);
			  pri.hands[0].deductFromBet(betSplitAmount);
			  pri.hands[1].addToBet(betSplitAmount);
			  pri.hands[1].addCard(pri.hands[0].drawFirstCard());
			  pri.onEvent('split', pri.state, "Splitting..");
			  
			  pub.actions.hit();
			  
			} else {
			   pri.onEvent('message', pri.state, "You can't split your cards unless they're the same value, and it's the initial deal.");
			}
			
		},
		surrender: function() {
			if(!pri.gameIsActive()) return false; //Need an active game
			pri.hands.length = 0;
			pri.actions.check();
		}
	}
	
	pub.availableActions = Object.keys(pub.actions);
	
	//Initial Instructions
	var msg = [
		"╔╗ ╦  ╔═╗╔═╗╦╔═ ╦╔═╗╔═╗╦╔═",
		"╠╩╗║  ╠═╣║  ╠╩╗ ║╠═╣║  ╠╩╗",
		"╚═╝╩═╝╩ ╩╚═╝╩ ╩╚╝╩ ╩╚═╝╩ ╩",
		" ",
		"Default bet : "+pri.defaultBet+"$",
		"Decks used  : "+ pri.deckCount,
		"Balance     : "+pri.playerWallet.getBalance()+"$",
		" "
	]
	.concat(
		pub.availableActions
		.map(function(v,k) {
			return "("+k+") " + v.toUpperCase();
		})
	);
	
	msg.push("");
	
	pri.onEvent('init', pri.state, msg);
	
};