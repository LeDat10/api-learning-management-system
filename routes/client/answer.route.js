const express = require("express");
const router = express.Router();

const controller = require("../../controllers/client/answer.controller");

router.post('/save', controller.saveOrUpdateAnswer);

router.get("/:attemptId", controller.getAnswerByAttemptId);

router.post("/submited", controller.submitQuiz);

module.exports = router;