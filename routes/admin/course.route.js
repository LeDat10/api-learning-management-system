const express = require("express");
const multer = require("multer");
const router = express.Router();
const upload = multer();

const controller = require("../../controllers/admin/course.controller");
const uploadToCloudHelper = require("../../helper/uploadToCloudDinary");

router.get('/', controller.index);

router.get('/categories', controller.getCategories);

router.post('/create', upload.single("thumbnail"), uploadToCloudHelper.uploadToCloud, controller.create);

router.patch('/edit/:courseId', upload.single("thumbnail"), uploadToCloudHelper.uploadToCloud, controller.edit);

router.patch('/change-status/:courseId', controller.changeStatus);

router.patch('/change-toggle/:courseId', controller.changeToggle);

router.patch('/change-multi', controller.changeMulti);

router.get('/detail/:courseId', controller.detail);

router.delete('/delete/:courseId', controller.del);

router.get('/trash', controller.trash);

router.patch('/trash/restore/:courseId', controller.restore);

router.delete('/trash/delete/:courseId', controller.deletePermanently);

router.patch('/trash/restore-multi', controller.restoreMulti);

module.exports = router;