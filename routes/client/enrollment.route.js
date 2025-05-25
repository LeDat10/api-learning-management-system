const express = require("express");
const router = express.Router();

const controller = require("../../controllers/client/enrollment.controller");

router.post('/register', controller.registerEnrollment);

router.post('/cancel', controller.cancelEnrollment);

router.post('/code-register', controller.codeRegister);

module.exports = router;