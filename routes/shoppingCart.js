const router = require("express").Router();
const models = require("../models/");
const cookieParser = require("cookie-parser");

router.post("/shopping-cart/get-shopping-list", async (req, res, next) => {
	const cookies = cookieParser.JSONCookies(req.cookies);

	let listOfProductId_s;

	if (cookies["shopping-list"]) {
		listOfProductId_s = JSON.parse(cookies["shopping-list"]) || [];
	}

	let shoppingList = [];

	if (listOfProductId_s) {
		try {
			shoppingList = await models.productItem.find({ productId: { $in: listOfProductId_s } });
			res.json(shoppingList);
		} catch (err) {
			next({
				message: err.message
			});
		}
	}
});

module.exports = router;
