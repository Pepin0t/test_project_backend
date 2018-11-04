const router = require("express").Router();
const models = require("../models/");
const sharp = require("sharp");
const request = require("request");
const fs = require("fs");
const path = require("path");

exchangeRatesConverter = (price, currency, exchangeRates) => {
	if (price == 0) return null;

	if (exchangeRates) {
		if (currency === "USD" && exchangeRates[0].cc === "USD") {
			return (price / exchangeRates[0].rate).toFixed(2) + " $";
		} else if (currency === "RUB" && exchangeRates[1].cc === "RUB") {
			return Math.floor(price / exchangeRates[1].rate) + " руб";
		} else return price + " грн";
	} else return price + " грн";
};

router.post("/goods", async (req, res, next) => {
	const { to, currency } = req.body;

	let goods;
	try {
		goods = await models.productItem
			.find({})
			.populate("exchangeRates")
			.limit(to);

		goods.map(item => {
			let price = exchangeRatesConverter(item.price, currency, item.exchangeRates.rates);
			item.price = price;
		});
	} catch (error) {
		console.log(error);
	}

	res.status(200).json(goods);
});

router.post("/goods/product-item", async (req, res, next) => {
	const { productId, currency } = req.body;

	let item = {};
	try {
		item = await models.productItem.findOne({ productId }).populate("exchangeRates");

		item.price = exchangeRatesConverter(item.price, currency, item.exchangeRates.rates);
	} catch (error) {
		console.log(error);
	}

	res.status(200).json(item);
});

router.post("/goods/search/:condition", async (req, res, next) => {
	const { info, currency } = req.body;
	let goods;

	try {
		if (req.params.condition === "all") {
			goods = await models.productItem
				.find()
				.or([{ title: { $regex: info } }, { body: { $regex: info } }])
				.populate("exchangeRates");

			goods.map(item => {
				let price = exchangeRatesConverter(item.price, currency, item.exchangeRates.rates);
				item.price = price;
			});
		} else if (req.params.condition === "category_all") {
			goods = await models.productItem.find({ category: info }).populate("exchangeRates");

			goods.map(item => {
				let price = exchangeRatesConverter(item.price, currency, item.exchangeRates.rates);
				item.price = price;
			});
		} else {
			goods = [];
		}
	} catch (error) {
		console.log(error);
	}

	res.status(200).json(goods);
});

module.exports = router;
