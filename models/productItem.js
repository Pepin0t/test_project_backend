const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productItem = new Schema({
	title: {
		type: String,
		required: true
	},
	productImages: {
		type: Schema.Types.Mixed
	},
	description: {
		type: String
	},
	category: {
		type: String,
		required: true
	},
	productId: {
		type: String,
		required: true,
		unique: true
	},
	price: {
		type: String
	},
	date: {
		type: Date,
		default: Date.now()
	},
	exchangeRates: {
		type: Schema.Types.ObjectId,
		ref: "ExchangeRates"
	}
});

module.exports = mongoose.model("productItem", productItem);
