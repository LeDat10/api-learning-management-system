const express = require("express");
const router = express.Router();

const controller = require("../../controllers/client/lesson.controller");

router.get('/:sectionId/detail/:lessonId', controller.detail);

module.exports = router;