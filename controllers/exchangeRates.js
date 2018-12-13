const axios = require("axios");
const models = require("../models");
const EXCHANGE_RATES_MONGO_ID = require("../config").EXCHANGE_RATES_MONGO_ID;

// admin only
ADMIN_updateExchangeRates = async (req, res, next) => {
	let date = new Date();

	let year = date.getFullYear().toString();
	let month = ("0" + (date.getMonth() + 1)).slice(-2);
	let day = ("0" + date.getDate()).slice(-2);

	let fullDate = year + month + day;

	try {
		let check = await models.ExchangeRates.findOne({});

		if (!check) {
			// from bank API
			console.log("from bank API");

			let newRates = await axios.get(`https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?date=${fullDate}&json`);
			let result = await models.ExchangeRates.create({
				rates: [{ cc: newRates.data[27].cc, rate: newRates.data[27].rate }, { cc: newRates.data[19].cc, rate: newRates.data[19].rate }],
				date: fullDate,
				_id: EXCHANGE_RATES_MONGO_ID
			});

			res.status(200).json({ rates: result.rates, message: "В базе отсутствовали данные о курсе валют! Соответствующий раздел был создан!" });
		} else {
			// from DB
			console.log("from DB");

			if (check.date !== fullDate) {
				// update DB
				console.log("update DB");

				let newRates = await axios.get(`https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?date=${fullDate}&json`);
				let result = await models.ExchangeRates.findOneAndUpdate(
					{},
					{
						rates: [
							{ cc: newRates.data[27].cc, rate: newRates.data[27].rate },
							{ cc: newRates.data[19].cc, rate: newRates.data[19].rate }
						],
						date: fullDate
					},
					{ new: true }
				);
				res.status(200).json({ rates: result.rates, message: "Курс валют обновлен!" });
			} else {
				// old DB value
				console.log("old DB value");

				res.status(200).json({ rates: check.rates, message: "Курс валют актуальный на данный момент! Обновление не требуется!" });
			}
		}
	} catch (error) {
		console.log(error.message);
		res.status(400).json(null);
	}
};

ADMIN_getExchangeRates = async (req, res, next) => {
	try {
		let check = await models.ExchangeRates.findOne({});
		res.status(200).json(check.rates);
	} catch (error) {
		res.status(400).json(null);
	}
};

// ------------------------------------------------------------------------------------------------------------------------------

// users
getExchangeRates = async (req, res, next) => {
	try {
		let check = await models.ExchangeRates.findOne({});

		res.status(200).end();
	} catch (error) {
		res.status(400).end();
	}
};

module.exports = {
	ADMIN_getExchangeRates,
	ADMIN_updateExchangeRates,
	getExchangeRates
};
