if(typeof シ === "undefined") throw new Error("shared.js is required");

var app = {};

app.config = {
	playerInitialBalance: 100,
	defaultBet: 10,
	deckCount: 6
};

//Initialize a simulated command line prompt as the display surface, 
app.cmd = new CommandLine({
	focusOnInit : false,
	onEvent: function(event) {
		if(event === 'focus') document.body.className = "focus"; 
		if(event === 'blur' ) document.body.className = "blur"; 
	},
	onInput: function(s_Input) {
		
		//Map [Enter] to first command
		if(s_Input === "") s_Input = 0;
		
		//Map inbound numeric commands to internal string commands. Either work for control.
		if(s_Input == parseInt(s_Input)) {
			s_Input = app.blackJack.availableActions[parseInt(s_Input)];
		};
		
		//Check whether our game supports the requested command.
		if(シ.isFunction(app.blackJack.actions[s_Input])) {
			app.blackJack.actions[s_Input]()
		};
		
	}
});

//Initialize player wallet.
//Keeping the wallet separate so it could be used for other games, if they were implemented.
//BlackJack acts directly on the wallet object, through the supplied methods
app.playerWallet = new Wallet({
	balance: app.config.playerInitialBalance
});

//The game itself. 
app.blackJack = new BlackJack({
	defaultBet: app.config.defaultBet,
	deckCount: app.config.deckCount,
	playerWallet: app.playerWallet,
	onEvent: function(event, state, msg) {
		//When events happen, we could have logic here to react to them. 
		//Instead, we'll just pipe everything to the simulated console.
		if(msg) app.cmd.print(msg);
		
	}
});