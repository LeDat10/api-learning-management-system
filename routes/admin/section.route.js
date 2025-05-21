const express = require("express");
const router = express.Router();

const controller = require("../../controllers/admin/section.controller");

router.get('/:courseId', controller.index);

router.post('/:courseId/create', controller.create);

router.patch('/:courseId/change-status/:sectionId', controller.changeStatus);

router.patch('/:courseId/edit/:sectionId', controller.edit);

router.get('/:courseId/detail/:sectionId', controller.detail);

router.patch('/:courseId/change-multi', controller.changeMulti);

router.delete('/:courseId/delete/:sectionId', controller.delete);

router.get('/:courseId/trash', controller.trash);

router.patch('/:courseId/trash/restore/:sectionId', controller.restore);

router.delete('/:courseId/trash/delete/:sectionId', controller.deletePermanently);

router.patch('/:courseId/trash/restore-multi', controller.restoreMulti);

module.exports = router;