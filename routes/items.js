const router = require("express").Router();
const models = require("../models/");
const sharp = require("sharp");
const request = require("request");
const fs = require("fs");
const path = require("path");

router.post("/goods", async (req, res) => {
	const { from, to } = req.body;

	let content;
	try {
		content = await models.productItem.find({});
	} catch (error) {
		console.log(error);
	}

	let responseContent = content.slice(from, to);

	res.status(200).json(responseContent);
});

router.post("/goods/search/:condition", async (req, res) => {
	const { info } = req.body;
	let content;

	try {
		if (req.params.condition === "all") {
			content = await models.productItem.find().or([{ title: { $regex: info } }, { body: { $regex: info } }]);
		} else if (req.params.condition === "category_all") {
			content = await models.productItem.find({ category: info });
		} else {
			content = [];
		}
	} catch (error) {
		console.log(error);
	}

	res.status(200).json(content);
});

module.exports = router;
