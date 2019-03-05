const router = require("express").Router();
const jwt = require("jsonwebtoken");
const axios = require("axios");

const models = require("../models");

router.post("/sign-in", async (req, res, next) => {
	const { login, password } = req.body;

	let user = await models.User.findOne({ login });

	if (!user) {
		next({
			status: 403,
			message: "Неверный логин или пароль!"
		});
	} else {
		let result = await user.comparePasswords(password);

		if (!result) {
			next({
				status: 403,
				message: "Неверный логин или пароль!"
			});
		} else {
			switch (user.audience) {
				case "admin": {
					try {
						const { TELEGRAM_BOT_CHAT_ID, TELEGRAM_TOKEN } = process.env;

						const key = Math.random()
							.toString()
							.slice(2, 7);

						await models.Verification.findOneAndRemove({ user: user.login });
						await models.Verification.create({ user: user.login, key });
						await axios({
							method: "get",
							url: `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage?chat_id=${TELEGRAM_BOT_CHAT_ID}&parse_mode=html&text=${key}`
						});

						let timeLeft = 10; // seconds

						let jwtPayload = {
							user: user.login,
							audience: "admin",
							verified: false
						};

						jwt.sign(jwtPayload, process.env.SECRET_KEY, { expiresIn: timeLeft }, (err, token) => {
							if (!err) {
								res.status(200)
									.cookie("user-access", token, { maxAge: timeLeft * 1000 })
									.cookie("expires-in-date", Date.now() + timeLeft * 1000, { maxAge: timeLeft * 1000 })
									.json({ audience: "admin", verified: false });
							} else {
								next({
									message: err.message
								});
							}
						});
					} catch (err) {
						next({
							status: err.status,
							message: err.message
						});
					}
				}

				case "user": {
					let jwtPayload = {
						user: user.login,
						audience: "user"
					};

					jwt.sign(jwtPayload, process.env.SECRET_KEY, (err, token) => {
						if (!err) {
							res.status(200)
								.cookie("user-access", token)
								.json({ audience: "user", redirectPath: "/content/user-account" });
						} else {
							next({
								message: err.message
							});
						}
					});
				}
			}
		}
	}
});

// router.post("/sign-out", (req, res, next)=> {})

const createToken = user => {
	let jwtPayload = {
		user: user.login,
		audience: user.audience
	};

	const token = jwt.sign(jwtPayload, process.env.SECRET_KEY);

	if (token) {
		return token;
	} else {
		throw new Error("Непредвиденная ошибка!");
	}
};

router.post("/registration", async (req, res, next) => {
	const { login, password, confirmPassword } = req.body;

	const findUser = await models.User.findOne({ login });

	if (findUser) {
		next({
			status: 409,
			message: "Данное имя уже занято!"
		});
	} else {
		try {
			const user = await models.User.create({ login, password, audience: "user" });

			res.json({ registrationComplete: true });
		} catch (err) {
			next({
				status: 500,
				message: err.message
			});
		}
	}
});

router.post("/admin-verification", async (req, res, next) => {
	const { key } = req.body;
	const decoded = jwt.verify(req.headers.authorization, process.env.SECRET_KEY);
	let verification;

	try {
		verification = await models.Verification.findOne({ user: decoded.user });
	} catch (err) {
		next({
			message: err.message
		});
	}

	if (key === verification.key) {
		await models.Verification.findOneAndRemove({ user: verification.user });

		jwt.sign({ audience: "admin", verified: true }, process.env.SECRET_KEY, { expiresIn: "1h" }, (err, token) => {
			if (!err) {
				res.status(200)
					.cookie("user-access", token)
					.json({ verified: true, redirectPath: "/content/admin" });
			} else {
				next({
					message: err.message
				});
			}
		});
	} else {
		next({
			status: 403,
			message: null
		});
	}
});

router.get("/check-token", (req, res, next) => {
	jwt.verify(req.headers.authorization, process.env.SECRET_KEY, (err, decoded) => {
		if (!err) {
			let responseData;

			switch (decoded.audience) {
				case "admin": {
					responseData = {
						audience: decoded.audience,
						verified: decoded.verified,
						redirectPath: "/content/admin",
						permittedRoutes: ["/content/admin"]
					};

					break;
				}
				case "user": {
					responseData = {
						audience: decoded.audience,
						redirectPath: "/content/user-account",
						permittedRoutes: ["/content/user-account"]
					};
					break;
				}
				default:
					responseData = {};
			}

			res.status(200).json(responseData);
		} else {
			next({
				status: 401,
				message: err.message
			});
		}
	});
});

module.exports = router;
