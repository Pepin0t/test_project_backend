const router = require("express").Router();
const axios = require("axios");
const models = require("../models");

router.post("/api/get-exchange-rates", async (req, res) => {
	let date = new Date();

	let year = date.getFullYear().toString();
	let month = ("0" + (date.getMonth() + 1)).slice(-2);
	let day = ("0" + date.getDay()).slice(-2);

	let fullDate = year + month + day;

	try {
		let check = await models.ExchangeRates.findOne();
		if (!check) {
			// from bank API

			let newRates = await axios.get(`https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?date=${fullDate}&json`);
			let result = await models.ExchangeRates.create({
				rates: [{ cc: newRates.data[27].cc, rate: newRates.data[27].rate }, { cc: newRates.data[19].cc, rate: newRates.data[19].rate }],
				date: fullDate
			});

			res.status(200).json(result.rates);
		} else {
			// from DB

			if (check.date !== fullDate) {
				// update DB

				let newRates = await axios.get(`https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?date=${fullDate}&json`);
				let result = await models.ExchangeRates.findOneAndUpdate({
					rates: [{ cc: newRates.data[27].cc, rate: newRates.data[27].rate }, { cc: newRates.data[19].cc, rate: newRates.data[19].rate }],
					date: fullDate
				});
				res.status(200).json(result.rates);
			} else {
				// old DB value

				res.status(200).json(check.rates);
			}
		}
	} catch (error) {
		console.log(error.message);
		res.status(400).json(null);
	}
});

module.exports = router;
