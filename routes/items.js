const fs = require("fs");
const fsa = require("fs-extra");
const path = require("path");
const router = require("express").Router();
const multer = require("multer");
const getSlug = require("speakingurl");

const models = require("../models/");
const config = require("../config.js");

const exchangeRatesConverter = (price, currency, exchangeRates) => {
	if (price == 0) return null;

	if (exchangeRates) {
		if (currency === "USD" && exchangeRates[0].cc === "USD") {
			return (price / exchangeRates[0].rate).toFixed(2) + " $";
		} else if (currency === "RUB" && exchangeRates[1].cc === "RUB") {
			return Math.floor(price / exchangeRates[1].rate) + " руб";
		} else return price + " грн";
	} else return price + " грн";
};

const addFileProps = (req, res, next) => {
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
	req.fileProps.productItemFilesPath = path.join(process.cwd(), "assets", "product_images", productId);
	req.fileProps.count = fileCounter();

	next();
};

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		let fullsizeImagesPath = path.join(req.fileProps.productItemFilesPath, "fullsize");

		fs.mkdir(fullsizeImagesPath, { recursive: true }, err => cb(err, fullsizeImagesPath));
	},
	filename: (req, file, cb) => {
		cb(null, req.fileProps.productId + "-fullsize_" + req.fileProps.count() + path.extname(file.originalname));
	}
});

const upload = multer({ storage }).array("product_images");

// admin only
router.post("/admin/goods/add-product-item", [
	addFileProps,
	upload,
	async (req, res, next) => {
		const { title, description, price } = req.body;
		const { productId, productItemFilesPath } = req.fileProps;

		let productImages = { cover: null, fullsize: null };

		// files and folders
		if (req.files.length) {
			const coverImage = req.files[0];
			const coverImagePath = path.join(productItemFilesPath, "cover");
			const coverImageFileName = coverImage.filename.replace("fullsize_1", "cover");

			await fs.mkdir(coverImagePath, { recursive: true }, err => {
				if (!err) {
					fs.copyFile(coverImage.path, path.join(coverImagePath, coverImageFileName), err => {
						if (err) {
							next({
								status: 500,
								message: err.message
							});
						}
					});
				} else {
					next({
						status: 500,
						message: err.message
					});
				}
			});

			let fullsizeImagesArray = [];

			req.files.forEach(image => fullsizeImagesArray.push(path.join("/", "product_image", productId, "fullsize", image.filename)));

			productImages.cover = path.join("/", "product_image", productId, "cover", coverImageFileName);
			productImages.fullsize = fullsizeImagesArray;
		} else {
			// create empty folder
			fs.mkdir(productItemFilesPath, { recursive: true }, err => {
				if (err) {
					next({
						status: 500,
						message: err.message
					});
				}
			});
		}

		// DB
		try {
			const category = getSlug(req.body.category, { maintainCase: false });

			await models.productItsem.create({
				title,
				description,
				category,
				price,
				productImages,
				productId,
				exchangeRates: config.EXCHANGE_RATES_MONGO_ID
			});

			res.status(200).json({ message: "Продукт был успешно создан!", productURL: "/goods/" + category + "/" + productId });
		} catch (err) {
			fsa.remove(productItemFilesPath);

			setTimeout(() => {
				next({
					status: 500,
					message: err.message
				});
			}, 2000);
		}
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
	} catch (err) {
		next({
			status: 500,
			message: err.message
		});
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
	const { currency } = req.cookies;
	let info = req.body.info;
	let goods;

	try {
		if (req.params.condition === "all") {
			info = new RegExp(info, "i");

			goods = await models.productItem
				.find()
				.or([{ title: { $regex: info } }, { description: { $regex: info } }])
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
	} catch (err) {
		next({
			status: 500,
			message: err.message
		});
	}

	res.status(200).json(goods);
});

module.exports = router;
