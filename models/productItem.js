const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productItem = new Schema({
	title: {
		type: String,
		required: true,
		unique: true
	},
	img: {
		type: Array
	},
	body: {
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
		type: Number
	},
	date: {
		type: Date,
		default: Date.now()
	}
});

module.exports = mongoose.model("productItem", productItem);
