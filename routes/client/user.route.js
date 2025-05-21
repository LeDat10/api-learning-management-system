const express = require("express");
const router = express.Router();

const controller = require("../../controllers/client/user.controller");

router.post("/register", controller.register);

router.post("/confirmOTP", controller.confirmOTP);

router.post("/login", controller.login);
module.exports = router;