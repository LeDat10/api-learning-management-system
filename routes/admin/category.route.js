const express = require("express");
const multer = require("multer");
const router = express.Router();
const upload = multer();

const controller = require("../../controllers/admin/category.controller");
const uploadToCloudHelper = require("../../helper/uploadToCloudDinary");

router.get('/', controller.index);

router.post('/create', upload.single("thumbnail"), uploadToCloudHelper.uploadToCloud, controller.create);

router.patch('/change-status/:categoryId', controller.changeStatus);

router.patch('/change-multi', controller.changeMulti);

router.patch('/edit/:categoryId', upload.single("thumbnail"), uploadToCloudHelper.uploadToCloud, controller.edit);

router.get('/detail/:categoryId', controller.detail);

router.delete('/delete/:categoryId', controller.delete);

router.get('/trash', controller.trash);

router.patch('/trash/restore/:categoryId', controller.restore);

router.delete('/trash/delete/:categoryId', controller.deletePermanently);

router.patch('/trash/restore-multi', controller.restoreMulti);

module.exports = router;