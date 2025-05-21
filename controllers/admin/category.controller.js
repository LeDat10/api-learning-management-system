const Category = require("../../models/category.model");
const convertToSlugHelper = require("../../helper/convertToSlug");

//[GET] /api/admin/category
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

        const categories = await Category.find(find).sort(sort).limit(objPagination.limit).skip(objPagination.skip);
        const totalCategory = await Category.countDocuments({
            deleted: false
        });
        res.json({
            code: 200,
            message: "Lấy danh mục khóa học thành công!",
            categories: categories,
            totalCategory: totalCategory
        });
    } catch (error) {
        res.json({
            code: 400,
            message: "Lấy danh mục khóa học thất bại!"
        });
    };
};

//[POST] /api/admin/category/create
module.exports.create = async (req, res) => {
    try {
        if (req.body.position) {
            req.body.position = parseInt(req.body.position);
        } else {
            const count = await Category.countDocuments();
            req.body.position = count + 1;
        };

        const category = Category(req.body);
        await category.save();

        res.json({
            code: 200,
            message: "Thêm danh mục khóa học thành công!"
        });
    } catch (error) {
        res.json({
            code: 400,
            message: "Thêm danh mục khóa học thất bại!"
        });
    };
};

// [PATCH] /api/admin/category/change-status/:categoryId
module.exports.changeStatus = async (req, res) => {
    try {
        const categoryId = req.params.categoryId;

        await Category.updateOne({
            _id: categoryId
        }, req.body);

        res.json({
            code: 200,
            message: "Thay đổi trạng thái danh mục khóa học thành công!"
        });
    } catch (error) {
        res.json({
            code: 400,
            message: "Thay đổi trạng thái danh mục khóa học thất bại!"
        });
    };
};

// [PATCH] /api/admin/category/change-multi
module.exports.changeMulti = async (req, res) => {
    try {
        const { ids, key } = req.body;
        switch (key) {
            case 'active':
                await Category.updateMany({
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
                await Category.updateMany({
                    _id: { $in: ids }
                }, {
                    status: "inactive"
                });
                res.json({
                    code: 200,
                    message: "Cập nhật trạng thái dừng hoạt động thành công!"
                });
                break;
            case 'position':
                for (const item of ids) {
                    let [id, position] = item.split('-');
                    if (id && position) {
                        await Category.updateOne({
                            _id: id
                        }, {
                            position: position
                        });
                    };
                };
                res.json({
                    code: 200,
                    message: "Cập nhật vị trí danh mục thành công!"
                });
                break;
            case 'delete-all':
                await Category.updateMany({
                    _id: { $in: ids }
                }, {
                    deleted: true
                });
                res.json({
                    code: 200,
                    message: "Xóa danh mục khóa học thành công!"
                });
                break;
            default:
                res.json({
                    code: 400,
                    message: "Cập nhật nhiều danh mục thất bại!"
                });
                break;
        }
    } catch (error) {
        res.json({
            code: 400,
            message: "Cập nhật nhiều danh mục thất bại!"
        });
    };
};

//[GET] /api/admin/category/detail/:categoryId
module.exports.detail = async (req, res) => {
    try {
        const categoryId = req.params.categoryId;
        const category = await Category.findOne({
            _id: categoryId,
            deleted: false
        });

        res.json({
            code: 200,
            message: "Lấy chi tiết danh mục thành công!",
            category: category
        });
    } catch (error) {
        res.json({
            code: 400,
            message: "Lấy chi tiết danh mục thất bại!"
        });
    };
};

//[PATCH] /api/admin/category/edit/:categoryId
module.exports.edit = async (req, res) => {
    try {
        const categoryId = req.params.categoryId;
        req.body.position = parseInt(req.body.position);
        await Category.updateOne({
            _id: categoryId
        }, req.body);

        res.json({
            code: 200,
            message: "Cập nhật danh mục thành công!"
        });
    } catch (error) {
        res.json({
            code: 400,
            message: "Cập nhật danh mục thất bại!"
        });
    };
};

// [DELETE] /api/admin/category/delete/:categoryId
module.exports.delete = async (req, res) => {
    try {
        const categoryId = req.params.categoryId;
        await Category.updateOne({
            _id: categoryId
        }, {
            deleted: true,
            deletedAt: Date.now()
        });
        res.json({
            code: 200,
            message: "Xóa danh mục khóa học thành công!"
        });
    } catch (error) {
        res.json({
            code: 400,
            message: "Xóa danh mục khóa học thất bại!"
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

        const categories = await Category.find(find).sort(sort).limit(objPagination.limit).skip(objPagination.skip);
        const totalCategory = await Category.countDocuments({
            deleted: true
        });
        
        res.json({
            code: 200,
            message: "Lấy danh mục khóa học thành công!",
            categories: categories,
            totalCategory: totalCategory
        });
    } catch (error) {
        res.json({
            code: 400,
            message: "Lấy khóa học thất bại!"
        });
    };
};

//[PATCH] /api/admin/category/trash/restore/:categoryId
module.exports.restore = async (req, res) => {
    try {
        const categoryId = req.params.categoryId;
        await Category.updateOne({
            _id: categoryId
        }, {
            deleted: false
        });

        res.json({
            code: 200,
            message: "Khôi phục danh mục khóa học thành công!"
        });

    } catch (error) {
        res.json({
            code: 400,
            message: "Khôi phục danh mục khóa học thất bại!"
        });
    };
};

//[DELETE] /api/admin/category/trash/delete/:categoryId
module.exports.deletePermanently = async (req, res) => {
    try {
        const categoryId = req.params.categoryId;
        await Category.deleteOne({ _id: categoryId });
        res.json({
            code: 200,
            message: "Xóa vĩnh viễn danh mục khóa học thành công!"
        });
    } catch (error) {
        res.json({
            code: 400,
            message: "Xóa vĩnh viễn danh mục khóa học thất bại!"
        });
    };
};

//[PATCH] /api/admin/category/trash/restore-multi
module.exports.restoreMulti = async (req, res) => {
    try {
        const { ids, key } = req.body;
        switch (key) {
            case 'restore':
                await Category.updateMany({
                    _id: { $in: ids }
                }, {
                    deleted: false
                });
                res.json({
                    code: 200,
                    message: "Khôi phục danh mục khóa học thành công!"
                })
                break;
            case 'delete':
                await Category.deleteMany({
                    _id: { $in: ids }
                });

                res.json({
                    code: 200,
                    message: "Xóa vĩnh viễn danh mục khóa học thành công!"
                });
                break;
            default:
                res.json({
                    code: 400,
                    message: "Khôi phục/xóa danh mục khóa học thất bại!"
                });
                break;
        };
    } catch (error) {
        res.json({
            code: 400,
            message: "Khôi phục/xóa danh mục khóa học thất bại!"
        });
    };
};