const router = require("express").Router();

const { ADMIN_getExchangeRates, ADMIN_updateExchangeRates, getExchangeRates } = require("../controllers/exchangeRates.js");

// admin only
router.post("/api/admin/get-exchange-rates", ADMIN_getExchangeRates);
router.post("/api/admin/update-exchange-rates", ADMIN_updateExchangeRates);

// users
router.head("/api/get-exchange-rates", getExchangeRates);

module.exports = router;
