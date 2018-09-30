const router = require("express").Router();
const models = require("../models/");

router.get("/goods", async (req, res) => {
	let content;
	try {
		content = await models.productItem.find({});
	} catch (error) {
		console.log(error);
	}
	res.status(200).json(content);
});

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

module.exports = router;
