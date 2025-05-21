const Section = require("../../models/section.model");
const convertToSlugHelper = require("../../helper/convertToSlug");

// [GET] /api/admin/sections/:courseId
module.exports.index = async (req, res) => {
    try {
        const courseId = req.params.courseId;

        const find = {
            courseId: courseId,
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

        const sections = await Section.find(find).sort(sort).limit(objPagination.limit).skip(objPagination.skip);
        const totalSection = await Section.countDocuments({
            deleted: false,
            courseId: courseId
        });

        res.json({
            code: 200,
            message: "Lấy thành phần khóa học thành công!",
            sections: sections,
            totalSection: totalSection
        });

    } catch (error) {
        res.json({
            code: 400,
            message: "Lấy thành phần khóa học thất bại!"
        });
    };
};

// [POST] /api/admin/sections/:courseId/create
module.exports.create = async (req, res) => {
    try {
        const courseId = req.params.courseId;
        if (req.body.position) {
            req.body.position = parseInt(req.body.position);
        } else {
            const count = await Section.countDocuments();
            req.body.position = count + 1;
        };

        req.body.courseId = courseId;

        const section = new Section(req.body);
        await section.save();

        res.json({
            code: 200,
            message: "Thêm chương vào khóa học thành công!"
        });
    } catch (error) {
        res.json({
            code: 400,
            message: "Thêm chương vào khóa học thất bại!"
        });
    }
};

// [PATCH] /api/admin/sections/:courseId/change-status/:sectionId
module.exports.changeStatus = async (req, res) => {
    try {
        const courseId = req.params.courseId;
        const sectionId = req.params.sectionId;
        const status = req.body.status;
        await Section.updateOne({
            courseId: courseId,
            _id: sectionId,
            deleted: false
        }, {
            status: status
        });

        res.json({
            code: 200,
            message: "Cập nhật trạng thái chương thành công!"
        });
    } catch (error) {
        res.json({
            code: 400,
            message: "Cập nhật trạng thái chương thất bại!"
        });
    };
};

// [PATCH] /api/admin/sections/:courseId/edit/:sectionId
module.exports.edit = async (req, res) => {
    try {
        const courseId = req.params.courseId;
        const sectionId = req.params.sectionId;

        req.body.position = parseInt(req.body.position);

        await Section.updateOne({
            _id: sectionId,
            courseId: courseId
        }, req.body);

        res.json({
            code: 200,
            message: "Cập nhật chương thành công!"
        });
    } catch (error) {
        res.json({
            code: 400,
            message: "Cập nhật chương thất bại!"
        });
    };
};

// [GET] /api/admin/sections/:courseId/detail/:sectionId
module.exports.detail = async (req, res) => {
    try {
        const courseId = req.params.courseId;
        const sectionId = req.params.sectionId;

        const section = await Section.findOne({
            _id: sectionId,
            courseId: courseId
        });

        res.json({
            code: 200,
            message: "Lấy chi tiết chương thành công!",
            section: section
        });
    } catch (error) {
        res.json({
            code: 400,
            message: "Lấy chi tiết chương thất bại!"
        });
    };
};

// [PATCH] /api/admin/sections/:courseId/change-multi
module.exports.changeMulti = async (req, res) => {
    try {
        const { ids, key } = req.body;
        const courseId = req.params.courseId;
        switch (key) {
            case 'active':
                await Section.updateMany({
                    _id: { $in: ids },
                    courseId: courseId
                }, {
                    status: "active"
                });
                res.json({
                    code: 200,
                    message: "Cập nhật trạng thái hoạt động thành công!"
                });
                break;
            case 'inactive':
                await Section.updateMany({
                    _id: { $in: ids },
                    courseId: courseId
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
                        await Section.updateOne({
                            _id: id,
                            courseId: courseId
                        }, {
                            position: position
                        });
                    };
                };
                res.json({
                    code: 200,
                    message: "Cập nhật vị trí chương thành công!"
                });
                break;
            case 'delete-all':
                await Section.updateMany({
                    _id: { $in: ids },
                    courseId: courseId
                }, {
                    deleted: true
                });
                res.json({
                    code: 200,
                    message: "Xóa nhiều chương thành công!"
                });
                break;
            default:
                res.json({
                    code: 400,
                    message: "Cập nhật nhiều chương thất bại!"
                });
                break;
        };
    } catch (error) {
        res.json({
            code: 400,
            message: "Cập nhật nhiều khóa học thất bại!"
        });
    };
};

// [DELETE] /api/admin/sections/:courseId/delete/:sectionId
module.exports.delete = async (req, res) => {
    try {
        const { courseId, sectionId } = req.params;

        await Section.updateOne({
            _id: sectionId,
            courseId: courseId
        }, {
            deleted: true
        });

        res.json({
            code: 200,
            message: "Xóa chương thành công!"
        });
    } catch (error) {
        res.json({
            code: 400,
            message: "Xóa chương thất bại!"
        });
    };
};

// [GET] /api/admin/sections/:courseId/trash
module.exports.trash = async (req, res) => {
    try {
        const courseId = req.params.courseId;
        const find = {
            courseId: courseId,
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

        const sections = await Section.find(find).sort(sort).limit(objPagination.limit).skip(objPagination.skip);
        
        const totalSection = await Section.countDocuments({
            courseId: courseId,
            deleted: true
        });

        res.json({
            code: 200,
            message: "Lấy chương đã xóa thành công!",
            sections: sections,
            totalSection: totalSection
        });
    } catch (error) {
        res.json({
            code: 400,
            message: "Lấy chương đã xóa thất bại!"
        });
    };
};

//[DELETE] /api/admin/sections/:courseId/trash/delete/:sectionId
module.exports.deletePermanently = async (req, res) => {
    try {
        const { courseId, sectionId } = req.params;
        await Section.deleteOne({
            _id: sectionId,
            courseId: courseId
        });
        res.json({
            code: 200,
            message: "Xóa vĩnh viễn chương thành công!"
        });
    } catch (error) {
        res.json({
            code: 400,
            message: "Xóa vĩnh viễn chương thất bại!"
        });
    };
};

//[PATCH] /api/admin/sections/:courseId/trash/restore/:sectionId
module.exports.restore = async (req, res) => {
    try {
        const { courseId, sectionId } = req.params;
        await Section.updateOne({
            _id: sectionId,
            courseId: courseId
        }, {
            deleted: false
        });

        res.json({
            code: 200,
            message: "Khôi phục chương thành công!"
        });

    } catch (error) {
        res.json({
            code: 400,
            message: "Khôi phục chương thất bại!"
        });
    };
};

//[PATCH] /api/admin/sections/:courseId/trash/restore-multi
module.exports.restoreMulti = async (req, res) => {
    try {
        const { ids, key } = req.body;
        const courseId = req.params.courseId;
        switch (key) {
            case 'restore':
                await Section.updateMany({
                    _id: { $in: ids },
                    courseId: courseId
                }, {
                    deleted: false
                });
                res.json({
                    code: 200,
                    message: "Khôi phục chương thành công!"
                })
                break;
            case 'delete':
                await Section.deleteMany({
                    _id: { $in: ids },
                    courseId: courseId
                });

                res.json({
                    code: 200,
                    message: "Xóa vĩnh viễn chương thành công!"
                });
                break;
            default:
                res.json({
                    code: 400,
                    message: "Khôi phục/xóa chương thất bại!"
                });
                break;
        };
    } catch (error) {
        res.json({
            code: 400,
            message: "Khôi phục/xóa chương thất bại!"
        });
    };
};