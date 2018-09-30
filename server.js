const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
const bluebird = require("bluebird");
const config = require("./config");
const routes = require("./routes");
// const fakes = require("./mocks");

const app = express();

mongoose.Promise = bluebird;

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

// Serve statcic assets if in production
if (process.env.NODE_ENV === "production") {
	// Set static folder
	app.use(express.static("client/build"));

	app.get("*", (req, res) => {
		res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
	});
}

app.listen(config.PORT, () => {
	console.log("Server is running on port: " + config.PORT);
});
