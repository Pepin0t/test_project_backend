const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const exchangeRates = new Schema({
	rates: {
		type: Array,
		required: true
	},
	date: {
		type: Date,
		default: Date.now()
	}
});

module.exports = mongoose.model("exchangeRates", exchangeRates);
