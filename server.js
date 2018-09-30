const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const config = require("./config");
const routes = require("./routes");
// const fakes = require("./mocks");

const app = express();

mongoose.set("useFindAndModify", false);
mongoose
	.connect(
		config.MONGO_URI,
		{ useNewUrlParser: true }
	)
	.then(() => {
		// fakes();
		console.log("Mongoose connected!");
	})
	.catch(e => {
		console.log("WTF, Mongoose?!");
		console.log(e);
	});

app.use(bodyParser.json());

// routes
app.use(routes.items);
app.use(routes.exchangeRates);

app.listen(config.PORT, () => {
	console.log("Server is running on port: " + config.PORT);
});
