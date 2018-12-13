const faker = require("faker");
const sharp = require("sharp");
const request = require("request");
const fs = require("fs");
const fse = require("fs-extra");
const path = require("path");
const config = require("../config");

const models = require("../models");

let categories = ["candies", "cakes", "bouquets", "presents", "balloons"];

// _id документа с курсом валют в БД
const exchangeRates = config.EXCHANGE_RATES_MONGO_ID;

const getFakes = async () => {
	await fse.remove("./assets/img/covers");
	await fse.remove("./assets/img/fullsize");

	await fs.mkdir(path.join("assets", "img", "covers"), err => {
		if (err) {
			console.log("mkdir error {covers}");
		}
	});

	await fs.mkdir(path.join("assets", "img", "fullsize"), err => {
		if (err) {
			console.log("mkdir error {fullsize}");
		}
	});

	try {
		await models.productItem.deleteMany();
	} catch (error) {
		console.log(error.errmsg);
	}
	console.log("kuku");

	for (let i = 0; i < categories.length; i++) {
		Array.from({ length: 20 }).forEach(async () => {
			try {
				let coverImage = `https://picsum.photos/1600/1200/?image=${Math.floor(Math.random() * 500 + 1)}`;

				let productId = Math.random()
					.toString()
					.slice(2, 9)
					.replace(/\d/, n => String.fromCharCode(70 + +n) + "-");
				let price = Number(Math.floor(Math.random() * 200));

				const dir = Math.random()
					.toString(36)
					.substr(2, 4);

				await fs.mkdir(path.join("assets", "img", "covers", dir), err => {
					if (err) console.log(err);
				});

				await fs.mkdir(path.join("assets", "img", "fullsize", dir), err => {
					if (err) console.log(err);
				});

				let otherImage = "https://picsum.photos/1600/1200/?image=";
				for (let j = 0; j < 3; j++) {
					await request({ url: otherImage + 32 + j, encoding: null }, function(error, response, body) {
						fs.writeFile(path.join("assets", "img", "fullsize", dir, `${productId}-fullsize_${j + 2}.jpg`), body, err => {
							if (err) console.log("fullsize error");
						});
					});
				}

				await request({ url: coverImage, encoding: null }, function(error, response, body) {
					if (!error) {
						fs.writeFile(path.join("assets", "img", "fullsize", dir, `${productId}-fullsize_1.jpg`), body, err => {
							if (err) console.log("fullsize error");
						});

						sharp(body)
							.resize(648, null)
							.toBuffer()
							.then(data => {
								fs.writeFile(path.join("assets", "img", "covers", dir, `${productId}-cover.jpg`), data, err => {
									if (err) {
										console.log("covers error");
									}
								});
							})
							.catch(err => console.log(err));
					} else {
						console.log(error);
					}
				});

				const productItem = await models.productItem.create({
					title: faker.lorem.word(),
					img: [
						path.join("/", "img", "covers", dir, `${productId}-cover.jpg`),
						[
							path.join("/", "img", "fullsize", dir, `${productId}-fullsize_1.jpg`),
							path.join("/", "img", "fullsize", dir, `${productId}-fullsize_2.jpg`),
							path.join("/", "img", "fullsize", dir, `${productId}-fullsize_3.jpg`),
							path.join("/", "img", "fullsize", dir, `${productId}-fullsize_4.jpg`)
						]
					],
					body: faker.lorem.words(200),
					category: categories[i],
					price,
					exchangeRates,
					productId
				});

				// console.log(productItem);
			} catch (error) {
				console.error(error.errmsg);
			}
		});
	}
};

module.exports = {
	getFakes
};
