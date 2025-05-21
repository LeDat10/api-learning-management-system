const express = require("express");
const router = express.Router();

const controller = require("../../controllers/client/section.controller");

router.get('/:courseId/detail/:sectionId', controller.detail);

module.exports = router;