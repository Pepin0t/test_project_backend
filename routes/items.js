const fs = require("fs");
const path = require("path");
const router = require("express").Router();
const multer = require("multer");
const getSlug = require("speakingurl");

const models = require("../models/");
const config = require("../config.js");

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

const fileNames = (req, res, next) => {
	req.fileProps = {};

	const productId = Math.random()
		.toString()
		.slice(2, 9)
		.replace(/\d/, n => String.fromCharCode(70 + +n) + "-");

	const fileCounter = () => {
		let count = 0;
		return () => ++count;
	};

	req.fileProps.productId = productId;
	req.fileProps.count = fileCounter();

	next();
};

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		let filePath = path.join(process.cwd(), "assets", "product_images", req.fileProps.productId, "fullsize");

		fs.mkdir(filePath, { recursive: true }, err => cb(err, filePath));
	},
	filename: (req, file, cb) => {
		cb(null, req.fileProps.productId + "-fullsize_" + req.fileProps.count() + path.extname(file.originalname));
	}
});

const upload = multer({ storage }).array("images");

// admin only
router.post("/admin/goods/add-product-item", [
	fileNames,
	upload,
	async (req, res, next) => {
		const { title, description, price } = req.body;
		let category = req.body.category;
		const productId = req.fileProps.productId;
		const coverImage = req.files[0];

		const coverDest = path.join(process.cwd(), "assets", "product_images", productId, "cover");

		fs.mkdir(coverDest, { recursive: true }, err => {
			if (!err) {
				const coverFileName = coverImage.filename.replace("fullsize_1", "cover");

				fs.copyFile(coverImage.path, path.join(coverDest, coverFileName), err => {
					if (err) {
						next(err);
					}
				});
			}
		});

		category = getSlug(category, { maintainCase: false });

		try {
			await models.productItem.create({
				title,
				body: description,
				category,
				price,
				productId,
				exchangeRates: config.EXCHANGE_RATES_MONGO_ID
			});

			res.status(200).json({ ok: true });
		} catch (error) {
			next(error);
		}

		// установить helmet и passport
	}
]);

router.delete("/admin/goods/delete-product-item/:id", (req, res, next) => {
	//
});

// users
router.post("/goods", async (req, res, next) => {
	const { to } = req.body;
	const { currency } = req.cookies;

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
	const { productId } = req.body;
	const { currency } = req.cookies;

	let item = {};

	try {
		item = await models.productItem.findOne({ productId }).populate("exchangeRates");

		item.price = exchangeRatesConverter(item.price, currency, item.exchangeRates.rates);
	} catch (error) {
		res.status(500).json(item);
	}

	res.status(200).json(item);
});

router.post("/goods/search/:condition", async (req, res, next) => {
	const { info } = req.body;
	const { currency } = req.cookies;
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
