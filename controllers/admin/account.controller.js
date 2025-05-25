const Account = require("../../models/account.model");
const Role = require("../../models/role.model");
const jwt = require("jsonwebtoken");
const argon2 = require("argon2");
const convertToSlugHelper = require("../../helper/convertToSlug");

// [GET] /api/admin/accounts
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
                { fullName: keywordRegex },
                { slug: stringSlugRegex }
            ];
        };
        //End Search

        // Status
        if (req.query.status) {
            find.status = req.query.status;
        };
        // End Status

        const sort = {};

        // Sort
        if (req.query.sortKey && req.query.sortValue) {
            sort[req.query.sortKey] = req.query.sortValue;
        } else {
            sort.position = "desc";
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

        const accounts = await Account.find(find).sort(sort).limit(objPagination.limit).skip(objPagination.skip).select("avatar fullName email status role_id").lean();
        const totalAccount = await Account.countDocuments({ deleted: false });
        const accountsWithRole = await Promise.all(accounts.map(async (account) => {
            if (account.role_id) {
                const role = await Role.findOne({
                    _id: account.role_id,
                    deleted: false
                }).lean();

                return {
                    ...account,
                    roleTitle: role?.title || null
                };
            } else {
                return {
                    ...account,
                    roleTitle: null
                };
            };
        }));

        res.json({
            code: 200,
            accounts: accountsWithRole,
            totalAccount: totalAccount,
            message: "Lấy danh sách tài khoản thành công!"
        });
    } catch (error) {
        console.log(error);
        res.json({
            code: 400,
            message: "Lấy danh sách tài khoản thất bại!"
        });
    };
};

// [POST] /api/admin/accounts/create
module.exports.create = async (req, res) => {
    try {
        const emailExist = await Account.findOne({
            email: req.body.email,
            deleted: false
        });

        if (emailExist) {
            res.json({
                code: 409,
                message: "Email đã tồn tại!"
            });
            return;
        };

        req.body.password = await argon2.hash(req.body.password);
        const account = Account(req.body);
        await account.save();
        res.json({
            code: 200,
            message: "Tạo tài khoản thành công!"
        });

    } catch (error) {
        res.json({
            code: 400,
            message: "Tạo tài khoản thất bại!"
        });
    };
};

// [GET] /api/admin/accounts/get-roles
module.exports.getRoles = async (req, res) => {
    try {
        const roles = await Role.find({
            deleted: false
        });

        res.json({
            code: 200,
            message: "Lấy danh sách nhóm quyền thành công!",
            roles: roles
        });
    } catch (error) {
        res.json({
            code: 400,
            message: "Lấy danh sách nhóm quyền thất bại!"
        });
    };
};

// [PATCH] /api/admin/accounts/change-status/:accountId
module.exports.changeStatus = async (req, res) => {
    try {
        const accountId = req.params.accountId;

        await Account.updateOne({
            _id: accountId
        }, req.body);

        res.json({
            code: 200,
            message: "Thay đổi trạng thái tài khoản thành công!"
        });
    } catch (error) {
        res.json({
            code: 400,
            message: "Thay đổi trạng thái tài khoản thất bại!"
        });
    };
};

// [PATCH] /api/admin/accounts/change-multi
module.exports.changeMulti = async (req, res) => {
    try {
        const { ids, key } = req.body;
        switch (key) {
            case 'active':
                await Account.updateMany({
                    _id: { $in: ids }
                }, {
                    status: "active"
                });
                res.json({
                    code: 200,
                    message: "Cập nhật trạng thái hoạt động thành công!"
                });
                break;
            case 'inactive':
                await Account.updateMany({
                    _id: { $in: ids }
                }, {
                    status: "inactive"
                });
                res.json({
                    code: 200,
                    message: "Cập nhật trạng thái dừng hoạt động thành công!"
                });
                break;
            case 'delete-all':
                await Account.updateMany({
                    _id: { $in: ids }
                }, {
                    deleted: true
                });
                res.json({
                    code: 200,
                    message: "Xóa tài khoản thành công!"
                });
                break;
            default:
                res.json({
                    code: 400,
                    message: "Cập nhật tài khoản thất bại!"
                });
                break;
        }
    } catch (error) {
        res.json({
            code: 400,
            message: "Cập nhật tài khoản thất bại!"
        });
    };
};

//[GET] /api/admin/accounts/detail/:accountId
module.exports.detail = async (req, res) => {
    try {
        const accountId = req.params.accountId;
        const account = await Account.findOne({
            _id: accountId,
            deleted: false
        }).select("avatar fullName email status role_id").lean();

        if (account.role_id) {
            const role = await Role.findOne({
                _id: account.role_id,
                deleted: false
            }).lean();
            account.roleTitle = role.title;
        };

        res.json({
            code: 200,
            message: "Lấy chi tiết tài khoản thành công!",
            account: account
        });
    } catch (error) {
        res.json({
            code: 400,
            message: "Lấy chi tiết tài khoản thất bại!"
        });
    };
};

//[PATCH] /api/admin/accounts/edit/:accountId
module.exports.edit = async (req, res) => {
    try {
        const accountId = req.params.accountId;

        if (req.body.password) {
            req.body.password = await argon2.hash(req.body.password);
        }

        await Account.updateOne({
            _id: accountId
        }, req.body);

        res.json({
            code: 200,
            message: "Cập nhật tài khoản thành công!"
        });
    } catch (error) {
        res.json({
            code: 400,
            message: "Cập nhật tài khoản thất bại!"
        });
    };
};

// [DELETE] /api/admin/accounts/delete/:accountId
module.exports.del = async (req, res) => {
    try {
        const accountId = req.params.accountId;
        await Account.updateOne({
            _id: accountId
        }, {
            deleted: true
        });
        res.json({
            code: 200,
            message: "Xóa tài khoản thành công!"
        });
    } catch (error) {
        res.json({
            code: 400,
            message: "Xóa tài khoản thất bại!"
        });
    };
};

// [GET] /api/admin/category/trash
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
                { fullName: keywordRegex },
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

        const accounts = await Account.find(find).sort(sort).limit(objPagination.limit).skip(objPagination.skip).select("avatar fullName email status role_id").lean();
        const totalAccount = await Account.countDocuments({ deleted: false });
        const accountsWithRole = await Promise.all(accounts.map(async (account) => {
            if (account.role_id) {
                const role = await Role.findOne({
                    _id: account.role_id,
                    deleted: false
                }).lean();

                return {
                    ...account,
                    roleTitle: role?.title || null
                };
            } else {
                return {
                    ...account,
                    roleTitle: null
                };
            };
        }));

        res.json({
            code: 200,
            accounts: accountsWithRole,
            totalAccount: totalAccount,
            message: "Lấy danh sách tài khoản thành công!"
        });
    } catch (error) {
        res.json({
            code: 400,
            message: "Lấy danh sách tài khoản thất bại!"
        });
    };
};

//[PATCH] /api/admin/accounts/trash/restore/:accountId
module.exports.restore = async (req, res) => {
    try {
        const accountId = req.params.accountId;
        await Account.updateOne({
            _id: accountId
        }, {
            deleted: false
        });

        res.json({
            code: 200,
            message: "Khôi phục tài khoản thành công!"
        });

    } catch (error) {
        res.json({
            code: 400,
            message: "Khôi phục tài khoản thất bại!"
        });
    };
};

//[DELETE] /api/admin/accounts/trash/delete/:accountId
module.exports.deletePermanently = async (req, res) => {
    try {
        const accountId = req.params.accountId;
        await Account.deleteOne({ _id: accountId });
        res.json({
            code: 200,
            message: "Xóa vĩnh viễn tài khoản thành công!"
        });
    } catch (error) {
        res.json({
            code: 400,
            message: "Xóa vĩnh viễn tài khoản thất bại!"
        });
    };
};

//[PATCH] /api/admin/accounts/trash/restore-multi
module.exports.restoreMulti = async (req, res) => {
    try {
        const { ids, key } = req.body;
        switch (key) {
            case 'restore':
                await Account.updateMany({
                    _id: { $in: ids }
                }, {
                    deleted: false
                });
                res.json({
                    code: 200,
                    message: "Khôi phục tài khoản thành công!"
                })
                break;
            case 'delete':
                await Account.deleteMany({
                    _id: { $in: ids }
                });

                res.json({
                    code: 200,
                    message: "Xóa vĩnh viễn tài khoản thành công!"
                });
                break;
            default:
                res.json({
                    code: 400,
                    message: "Khôi phục/xóa tài khoản thất bại!"
                });
                break;
        };
    } catch (error) {
        res.json({
            code: 400,
            message: "Khôi phục/xóa tài khoản thất bại!"
        });
    };
};

// [POST] /api/accounts/login
module.exports.login = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        const account = await Account.findOne({
            email: email,
            deleted: false
        });

        if (!account) {
            res.json({
                code: 401,
                message: "Email đăng nhập không tồn tại!"
            });
            return;
        }

        const match = await argon2.verify(account.password, password);

        if (!match) {
            res.json({
                code: 401,
                message: "Mật khẩu đăng nhập không đúng!"
            });
            return;
        };

        const role = await Role.findOne({
            _id: account.role_id
        });

        const payload = {
            id: account.id,
            email: account.email,
            fullName: account.fullName,
            tokenVersion: account.tokenVersion,
            permissions: role.permissions
        };

        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRE
            }
        );

        res.json({
            code: 200,
            message: "Đăng nhập thành công!",
            token: token
        });
    } catch (error) {
        res.json({
            code: 400,
            message: "Đăng nhập thất bại!"
        });
    };
};

// [GET] /api/accounts/permissions
module.exports.getPermissions = async (req, res) => {
    try {
        const roleId = req.account.role_id;
        const role = await Role.findOne({
            _id: roleId,
            deleted: false
        });
        res.json({
            code: 200,
            message: "Lấy quyền tài khoản thành công!",
            permissions: role.permissions
        });
    } catch (error) {
        res.json({
            code: 400,
            message: "Lấy quyền tài khoản thất bại!",
        });
    };
};

// [GET] /api/admin/accounts/info-account
module.exports.infoAccount = async (req, res) => {
    try {
        const accountId = req.account._id;

        const account = await Account.findOne({
            _id: accountId,
            deleted: false,
            status: "active"
        }).select("fullName email avatar phone");

        if (!account) {
            return res.json({
                code: 400,
                message: "Không tìm thấy tài khoản!"
            });
        };

        return res.json({
            code: 200,
            message: "Lấy tài khoản thành công!",
            account: account
        });
    } catch (error) {
        return res.json({
            code: 400,
            message: "Lấy tài khoản thất bại!"
        });
    };
};

// [POST] /api/admin/accounts/logout
module.exports.logout = async (req, res) => {
    try {
        const accountId = req.account._id;
        await Account.updateOne({
            _id: accountId,
            deleted: false,
            status: "active"
        }, { $inc: { tokenVersion: 1 } });

        return res.json({
            code: 200,
            message: "Đăng xuất tài khoản thành công!"
        });
    } catch (error) {
        return res.json({
            code: 400,
            message: "Đăng xuất tài khoản thất bại!"
        });
    };
};