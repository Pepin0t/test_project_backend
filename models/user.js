const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const User = new mongoose.Schema({
	login: {
		type: String,
		unique: true,
		required: true
	},
	password: {
		type: String,
		required: true
	},
	audience: {
		type: String,
		default: "user"
	}
});

User.pre("save", async function(next) {
	if (!this.isModified("password")) {
		return next();
	}

	const salt = await bcrypt.genSalt(10);
	const hash = await bcrypt.hash(this.password, salt);

	this.password = hash;
	next();
});

User.methods.comparePasswords = function(password) {
	return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("User", User);
