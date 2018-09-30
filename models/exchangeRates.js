const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ExchangeRates = new Schema({
	rates: {
		type: Array,
		required: true
	},
	date: {
		type: String,
		required: true
	}
});

module.exports = mongoose.model("ExchangeRates", ExchangeRates);
