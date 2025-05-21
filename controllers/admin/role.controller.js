const Role = require("../../models/role.model");
const Account = require("../../models/account.model");
const convertToSlugHelper = require("../../helper/convertToSlug");

// [GET] /api/admin/roles
module.exports.index = async (req, res) => {

    try {

        const find = {
            deleted: false
        };

        // Search
        if (req.query.keyword) {
            const keywordRegex = new RegExp(req.query.keyword, "i");
            const stringSlug = convertToSlugHelper.convertToSlug(req.query.keyword);
            const stringSlugRegex = new RegExp(stringSlug, "i");
            find["$or"] = [
                { title: keywordRegex },
                { slug: stringSlugRegex }
            ];
        };
        //End Search

        const sort = {};
        // Sort
        if (req.query.sortKey && req.query.sortValue) {
            sort[req.query.sortKey] = req.query.sortValue;
        } else {
            sort.position = "asc";
        }
        // End Sort

        // pagination
        const objPagination = {
            currentPage: 1,
            limit: 5
        };

        if (req.query.page) {
            objPagination.currentPage = parseInt(req.query.page);
        };

        if (req.query.limit) {
            objPagination.limit = parseInt(req.query.limit);
        }

        objPagination.skip = (objPagination.currentPage - 1) * objPagination.limit;
        // End pagination

        const roles = await Role.find(find).sort(sort).limit(objPagination.limit).skip(objPagination.skip);
        const totalRole = await Role.countDocuments({ deleted: false });

        res.json({
            code: 200,
            message: "Lấy nhóm quyền thành công!",
            roles: roles,
            totalRole: totalRole
        });
    } catch (error) {
        res.json({
            code: 400,
            message: "Lấy nhóm quyền thất bại!"
        });
    }
};

// [POST] /api/admin/roles/create
module.exports.create = async (req, res) => {
    try {
        const role = Role(req.body);
        await role.save();
        res.json({
            code: 200,
            message: "Thêm nhóm quyền thành công!"
        });
    } catch (error) {
        res.json({
            code: 400,
            message: "Thêm nhóm quyền thất bại!"
        });
    };
};

// [PATCH] /api/admin/roles/change-multi
module.exports.changeMulti = async (req, res) => {
    try {
        const { ids, key } = req.body;
        switch (key) {
            case 'delete-all':
                await Role.updateMany({
                    _id: { $in: ids }
                }, {
                    deleted: true,
                    deletedAt: Date.now()
                });
                res.json({
                    code: 200,
                    message: "Xóa nhóm quyền thành công!"
                });
                break;
            default:
                res.json({
                    code: 400,
                    message: "Cập nhật nhiều nhóm quyền thất bại!"
                });
                break;
        };
    } catch (error) {
        res.json({
            code: 400,
            message: "Cập nhật nhiều nhóm quyền thất bại!"
        });
    }
};

// [DELETE] /api/admin/roles/delete/:roleId
module.exports.delete = async (req, res) => {
    try {
        const roleId = req.params.roleId;
        await Role.updateOne({
            _id: roleId
        }, {
            deleted: true,
            deletedAt: Date.now()
        });

        res.json({
            code: 200,
            message: "Xóa nhóm quyền thành công!"
        });
    } catch (error) {
        res.json({
            code: 400,
            message: "Xóa nhóm quyền thất bại!"
        });
    };
};

// [GET] /api/admin/roles/detail/:roleId
module.exports.detail = async (req, res) => {
    try {
        const roleId = req.params.roleId;

        const role = await Role.findOne({
            _id: roleId,
            deleted: false
        });

        res.json({
            code: 200,
            role: role,
            message: "Lấy chi tiết nhóm quyền thành công!"
        });
    } catch (error) {
        res.json({
            code: 400,
            message: "Lấy chi tiết nhóm quyền thất bại!"
        });
    }
};

// [PATCH] /api/admin/roles/edit/:roleId
module.exports.edit = async (req, res) => {
    try {
        const roleId = req.params.roleId;

        await Role.updateOne({
            _id: roleId,
        }, req.body);

        res.json({
            code: 200,
            message: "Cập nhật nhóm quyền thành công!"
        });
    } catch (error) {
        res.json({
            code: 400,
            message: "Cập nhật nhóm quyền thất bại!"
        });
    };
};

// [PATCH] /api/admin/roles/permissions
module.exports.permissions = async (req, res) => {
    try {
        const { id, permissions } = req.body;

        await Role.updateOne({
            _id: id
        }, {
            permissions: permissions
        });

        await Account.updateMany({
            role_id: id
        }, { $inc: { tokenVersion: 1 } });

        res.json({
            code: 200,
            message: "Cập nhật phân quyền thành công!"
        });
    } catch (error) {
        res.json({
            code: 400,
            message: "Cập nhật phân quyền thất bại!"
        });
    };
};

// [GET] /api/admin/roles/trash
module.exports.trash = async (req, res) => {
    try {

        const find = {
            deleted: true
        };

        // Search
        if (req.query.keyword) {
            const keywordRegex = new RegExp(req.query.keyword, "i");
            const stringSlug = convertToSlugHelper.convertToSlug(req.query.keyword);
            const stringSlugRegex = new RegExp(stringSlug, "i");
            find["$or"] = [
                { title: keywordRegex },
                { slug: stringSlugRegex }
            ];
        };
        //End Search

        const sort = {};

        // Sort
        if (req.query.sortKey && req.query.sortValue) {
            sort[req.query.sortKey] = req.query.sortValue;
        } else {
            sort.title = "asc";
        }
        // End Sort

        // pagination
        const objPagination = {
            currentPage: 1,
            limit: 5
        };

        if (req.query.page) {
            objPagination.currentPage = parseInt(req.query.page);
        };

        if (req.query.limit) {
            objPagination.limit = parseInt(req.query.limit);
        }

        objPagination.skip = (objPagination.currentPage - 1) * objPagination.limit;
        // End pagination

        const roles = await Role.find(find).sort(sort).limit(objPagination.limit).skip(objPagination.skip);
        const totalRole = await Role.countDocuments({
            deleted: true
        });

        res.json({
            code: 200,
            message: "Lấy nhóm quyền thành công!",
            roles: roles,
            totalRole: totalRole
        });
    } catch (error) {
        res.json({
            code: 400,
            message: "Lấy nhóm quyền thất bại!"
        });
    };
};

//[PATCH] /api/admin/roles/trash/restore/:roleId
module.exports.restore = async (req, res) => {
    try {
        const roleId = req.params.roleId;
        await Role.updateOne({
            _id: roleId
        }, {
            deleted: false
        });

        res.json({
            code: 200,
            message: "Khôi phục nhóm quyền thành công!"
        });

    } catch (error) {
        res.json({
            code: 400,
            message: "Khôi phục nhóm quyền thất bại!"
        });
    };
};

//[DELETE] /api/admin/roles/trash/delete/:roleId
module.exports.deletePermanently = async (req, res) => {
    try {
        const roleId = req.params.roleId;
        await Role.deleteOne({ _id: roleId });
        res.json({
            code: 200,
            message: "Xóa vĩnh viễn nhóm quyền thành công!"
        });
    } catch (error) {
        res.json({
            code: 400,
            message: "Xóa vĩnh viễn nhóm quyền thất bại!"
        });
    };
};

//[PATCH] /api/admin/roles/trash/restore-multi
module.exports.restoreMulti = async (req, res) => {
    try {
        const { ids, key } = req.body;
        switch (key) {
            case 'restore':
                await Role.updateMany({
                    _id: { $in: ids }
                }, {
                    deleted: false
                });
                res.json({
                    code: 200,
                    message: "Khôi phục nhóm quyền thành công!"
                })
                break;
            case 'delete':
                await Role.deleteMany({
                    _id: { $in: ids }
                });

                res.json({
                    code: 200,
                    message: "Xóa vĩnh viễn nhóm quyền thành công!"
                });
                break;
            default:
                res.json({
                    code: 400,
                    message: "Khôi phục/xóa nhóm quyền thất bại!"
                });
                break;
        };
    } catch (error) {
        res.json({
            code: 400,
            message: "Khôi phục/xóa nhóm quyền thất bại!"
        });
    };
};