const express = require("express");
const router = express.Router();

const controller = require("../../controllers/client/quiz-attempt.controller");

router.post('/', controller.createQuizAttempt);

// router.get('/info/:lessonId', controller.infoAttempt);

module.exports = router;