const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const path = require("path");
const bluebird = require("bluebird");
const config = require("./config");
const routes = require("./routes");
// const { getFakes } = require("./mocks");

const app = express();

const PORT = config.PORT;
const MONGO_URI = config.MONGO_URI;

mongoose.Promise = bluebird;
mongoose.set("useFindAndModify", false);
mongoose
	.connect(
		MONGO_URI,
		{ useNewUrlParser: true, autoReconnect: true }
	)
	.then(() => {
		console.log("Mongoose connected!");
	})
	.then(() => {
		// get fakes
		// getFakes();
	})
	.catch(e => {
		console.log("WTF, Mongoose?!");
		console.log(e);
	});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// routes
app.use("/api", routes.items);
app.use("/api", routes.shoppingCart);
app.use("/api", routes.exchangeRates);

// static
app.use("/img", express.static(path.join(__dirname, "assets/img")));

if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "client")));

	app.get("*", (req, res) => {
		res.sendFile(path.resolve(__dirname, "client", "index.html"));
	});
}

// !! прикрутить обработчик ошибок

app.listen(PORT, () => {
	console.log("Server is running on port " + PORT);
});
