const express = require("express");
const router = express.Router();

const controller = require("../../controllers/admin/role.controller");

router.get('/', controller.index);

router.post('/create', controller.create);

router.patch('/change-multi', controller.changeMulti);

router.delete('/delete/:roleId', controller.delete);

router.get('/detail/:roleId', controller.detail);

router.patch('/edit/:roleId', controller.edit);

router.patch('/permissions', controller.permissions);

router.get('/trash', controller.trash);

router.patch('/trash/restore/:roleId', controller.restore);

router.delete('/trash/delete/:roleId', controller.deletePermanently);

router.patch('/trash/restore-multi', controller.restoreMulti);

module.exports = router;