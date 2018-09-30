const router = require("express").Router();
const axios = require("axios");
const models = require("../models/");

router.post("/api/get-exchange-rates", async (req, res) => {
	let rates;
	try {
		rates = await axios.get("https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?date=20180929&json");
	} catch (error) {
		console.log(error);
	}

	res.status(200).json([{ cc: rates.data[27].cc, rate: rates.data[27].rate }, { cc: rates.data[19].cc, rate: rates.data[19].rate }]);
});

module.exports = router;
