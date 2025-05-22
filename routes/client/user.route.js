const express = require("express");
const router = express.Router();

const controller = require("../../controllers/client/user.controller");

const authMiddleware = require("../../middlewares/client/auth.middleware");

router.post("/register", controller.register);

router.post("/confirmOTP", controller.confirmOTP);

router.post("/login", controller.login);

router.get("/detail", authMiddleware.requireAuth, controller.detail);

router.post("/logout", authMiddleware.requireAuth, controller.logout);

router.post("/password/forgot", controller.forgot);

router.post("/password/otp", controller.otpPassword);

router.post("/password/reset-password", controller.resetPassword);

module.exports = router;