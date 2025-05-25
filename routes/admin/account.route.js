const express = require("express");
const multer = require("multer");
const router = express.Router();
const upload = multer();

const controller = require("../../controllers/admin/account.controller");
const uploadToCloudHelper = require("../../helper/uploadToCloudDinary");

const authMiddleware = require("../../middlewares/admin/auth.middleware");

router.get('/', authMiddleware.requireAuth, controller.index);

router.post('/create', authMiddleware.requireAuth, upload.single("thumbnail"), uploadToCloudHelper.uploadToCloud, controller.create);

router.get('/get-roles', authMiddleware.requireAuth, controller.getRoles);

router.patch("/change-status/:accountId", authMiddleware.requireAuth, controller.changeStatus);

router.patch("/change-multi", authMiddleware.requireAuth, controller.changeMulti);

router.get("/detail/:accountId", authMiddleware.requireAuth, controller.detail);

router.patch("/edit/:accountId", authMiddleware.requireAuth, upload.single("thumbnail"), uploadToCloudHelper.uploadToCloud, controller.edit);

router.delete("/delete/:accountId", authMiddleware.requireAuth, controller.del);

router.get('/trash', authMiddleware.requireAuth, controller.trash);

router.patch('/trash/restore/:accountId', authMiddleware.requireAuth, controller.restore);

router.delete('/trash/delete/:accountId', authMiddleware.requireAuth, controller.deletePermanently);

router.patch('/trash/restore-multi', authMiddleware.requireAuth, controller.restoreMulti);

router.post('/login', controller.login);

router.get('/permissions', authMiddleware.requireAuth, controller.getPermissions);

router.get("/info-account", authMiddleware.requireAuth, controller.infoAccount);

router.post("/logout", authMiddleware.requireAuth, controller.logout);

module.exports = router;