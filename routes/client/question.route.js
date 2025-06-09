const express = require("express");
const router = express.Router();

const controller = require("../../controllers/client/question.controller");

router.get('/:lessonId/:attemptId', controller.questions);

module.exports = router;