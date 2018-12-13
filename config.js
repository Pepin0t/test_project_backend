const dotenv = require("dotenv");
const path = require("path");

const root = path.join.bind(this, __dirname);
dotenv.config({ path: root(".env") });

module.exports = {
	PORT: process.env.PORT || 5000,
	MONGO_URI: process.env.MONGO_URI,
	MONGO_URI2: process.env.MONGO_URI2,
	EXCHANGE_RATES_MONGO_ID: process.env.EXCHANGE_RATES_MONGO_ID
};
