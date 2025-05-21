const express = require("express");
const router = express.Router();

const controller = require("../../controllers/admin/lesson.controller");

router.get('/:sectionId', controller.index);

router.post('/:sectionId/create', controller.create);

router.patch('/:sectionId/change-multi', controller.changeMulti);

router.patch('/:sectionId/change-status/:lessonId', controller.changeStatus);

router.patch('/:sectionId/edit/:lessonId', controller.edit);

router.get('/:sectionId/detail/:lessonId', controller.detail);

router.delete('/:sectionId/delete/:lessonId', controller.delete);

router.get('/:sectionId/trash', controller.trash);

router.delete('/:sectionId/trash/delete/:lessonId', controller.deletePermanentlyText);

router.patch('/:sectionId/trash/restore/:lessonId', controller.restore);

router.patch('/:sectionId/trash/restore-multi', controller.restoreMulti);

module.exports = router;