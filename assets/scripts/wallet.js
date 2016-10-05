/*
	Wallet constructor
*/
function Wallet(options) {
	if (!(this instanceof arguments.callee)) throw new Error("Please use 'new' operator when calling " + arguments.callee);
	
	var pri = {};
	var pub = this;
	    pub.options = options || {};
	
		pub.balance = typeof pub.options.balance === "number" ? pub.options.balance : 0;
	
}

Wallet.prototype.addToBalance = function(val) {
	this.balance += parseFloat(val);
}

Wallet.prototype.deductFromBalance = function(val) {
	this.balance -= parseFloat(val);
}

Wallet.prototype.setBalance = function(val) {
	this.balance = parseFloat(val);
}

Wallet.prototype.getBalance = function(val) {
	return this.balance;
}