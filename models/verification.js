const mongoose = require("mongoose");

const Verification = new mongoose.Schema({
	user: {
		type: String,
		required: true,
		unique: true
	},
	key: {
		type: String
	},
	createdAt: {
		type: Date
	}
});

Verification.pre("save", function(next) {
	if (!this.createdAt) {
		this.createdAt = Date.now();
	} else {
		this.key = null;
		this.createdAt = 0;
	}
	next();
});

module.exports = mongoose.model("Verification", Verification);
