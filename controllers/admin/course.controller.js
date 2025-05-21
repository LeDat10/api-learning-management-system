const convertToSlugHelper = require("../../helper/convertToSlug");
const Course = require("../../models/course.model");
const Category = require('../../models/category.model');

// [GET] /api/admin/courses
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
        };
        // End Sort

        if (req.query.category) {
            find.categoryId = req.query.category;
        };

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

        const courses = await Course.find(find).sort(sort).limit(objPagination.limit).skip(objPagination.skip);
        const totalCourse = await Course.countDocuments({
            deleted: false
        });

        res.json({
            code: 200,
            message: "Lấy danh sách khóa học thành công!",
            courses: courses,
            totalCourse: totalCourse
        });
    } catch (error) {
        res.json({
            code: 400,
            message: "Lấy danh sách khóa học thất bại!"
        });
    };
};

// [GET] /api/admin/courses/categories
module.exports.getCategories = async(req, res) => {
    try {
        const categories = await Category.find({
            deleted: false,
            status: "active"
        });

        res.json({
            code: 200,
            message: "Lấy danh mục khóa học thành công!",
            categories: categories
        });
    } catch (error) {
        res.json({
            code: 400,
            message: "Lấy danh mục khóa học thất bại!",
        });
    };
};


// [POST] /api/admin/courses/create
module.exports.create = async (req, res) => {
    try {
        if (req.body.position) {
            req.body.position = parseInt(req.body.position);
        } else {
            const count = await Course.countDocuments();
            req.body.position = count + 1;
        }

        if (req.body.toggle === "true") {
            req.body.toggle = true;
        } else if (req.body.toggle === "false") {
            req.body.toggle = false;
        } else {
            delete req.body.toggle;
        }

        const course = new Course(req.body);
        await course.save();

        res.json({
            code: 200,
            message: "Thêm khóa học thành công!"
        });
    } catch (error) {
        res.json({
            code: 400,
            message: "Thêm khóa học thất bại!"
        });
    }
};

// [PATCH] /api/admin/courses/change-status/:courseId
module.exports.changeStatus = async (req, res) => {
    try {
        const id = req.params.courseId;
        const status = req.body.status;

        await Course.updateOne({ _id: id }, { status: status });
        res.json({
            code: 200,
            message: "Cập nhật trạng thái khóa học thành công!"
        });
    } catch (error) {
        res.json({
            code: 400,
            message: "Cập nhật trạng thái khóa học thất bại!"
        });
    };
};

// [PATCH] /api/admin/courses/change-toggle/:courseId
module.exports.changeToggle = async (req, res) => {
    try {
        const id = req.params.courseId;
        const toggle = req.body.toggle;

        await Course.updateOne({
            _id: id
        }, {
            toggle: toggle
        });
        res.json({
            code: 200,
            message: "Mở/đóng khóa học thành công!"
        })
    } catch (error) {
        res.json({
            code: 400,
            message: "Mở/đóng khóa học thất bại!"
        });
    }
};

// [PATCH] /api/admin/courses/change-multi
module.exports.changeMulti = async (req, res) => {
    try {
        const { ids, key } = req.body;
        switch (key) {
            case 'active':
                await Course.updateMany({
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
                await Course.updateMany({
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
                        await Course.updateOne({
                            _id: id
                        }, {
                            position: position
                        });
                    };
                };
                res.json({
                    code: 200,
                    message: "Cập nhật vị trí khóa học thành công!"
                });
                break;
            case 'toggle-on':
                await Course.updateMany({
                    _id: { $in: ids }
                }, {
                    toggle: true
                });
                res.json({
                    code: 200,
                    message: "Cập nhật khóa học mở thành công!"
                });
                break;
            case 'toggle-off':
                await Course.updateMany({
                    _id: { $in: ids }
                }, {
                    toggle: false
                });
                res.json({
                    code: 200,
                    message: "Cập nhật khóa học đóng thành công!"
                });
                break;
            case 'delete-all':
                await Course.updateMany({
                    _id: { $in: ids }
                }, {
                    deleted: true
                });
                res.json({
                    code: 200,
                    message: "Xóa khóa học đóng thành công!"
                });
                break;
            default:
                res.json({
                    code: 400,
                    message: "Cập nhật nhiều khóa học thất bại!"
                });
                break;
        }
    } catch (error) {
        res.json({
            code: 400,
            message: "Cập nhật nhiều khóa học thất bại!"
        });
    }
};

// [GET] /api/admin/courses/detail/:courseId
module.exports.detail = async (req, res) => {
    try {
        const courseId = req.params.courseId;
        const course = await Course.findOne({
            _id: courseId,
            deleted: false
        });
        res.json({
            code: 200,
            message: "Lấy khóa học thành công!",
            course: course
        });
    } catch (error) {
        res.json({
            code: 400,
            message: "Lấy khóa học thất bại!"
        });
    };
};

//[PATCH] /api/admin/courses/edit/:courseId
module.exports.edit = async (req, res) => {
    try {
        const courseId = req.params.courseId;
        req.body.position = parseInt(req.body.position);
        if (req.body.toggle === "true") {
            req.body.toggle = true;
        } else if (req.body.toggle === "false") {
            req.body.toggle = false;
        } else {
            delete req.body.toggle;
        }

        await Course.updateOne({
            _id: courseId
        }, req.body);

        res.json({
            code: 200,
            message: "Cập nhật khóa học thành công!"
        });
    } catch (error) {
        res.json({
            code: 400,
            message: "Cập nhật khóa học thất bại!"
        });
    };
};

// [DELETE] /api/admin/courses/delete/:courseId
module.exports.del = async (req, res) => {
    try {
        const courseId = req.params.courseId;
        await Course.updateOne({
            _id: courseId
        }, {
            deleted: true
        });
        res.json({
            code: 200,
            message: "Xóa khóa học thành công!"
        });
    } catch (error) {
        res.json({
            code: 400,
            message: "Xóa khóa học thất bại!"
        });
    };
};

// [GET] /api/admin/courses/trash
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

        const courses = await Course.find(find).sort(sort).limit(objPagination.limit).skip(objPagination.skip);
        const totalCourse = await Course.countDocuments({
            deleted: true
        });
        
        res.json({
            code: 200,
            message: "Lấy khóa học thành công!",
            courses: courses,
            totalCourse: totalCourse
        });
    } catch (error) {
        res.json({
            code: 400,
            message: "Lấy khóa học thất bại!"
        });
    };
};

//[PATCH] /api/admin/courses/trash/restore/:courseId
module.exports.restore = async (req, res) => {
    try {
        const courseId = req.params.courseId;
        await Course.updateOne({
            _id: courseId
        }, {
            deleted: false
        });

        res.json({
            code: 200,
            message: "Khôi phục khóa học thành công!"
        });

    } catch (error) {
        res.json({
            code: 400,
            message: "Khôi phục khóa học thất bại!"
        });
    };
};

//[DELETE] /api/admin/courses/trash/delete/:courseId
module.exports.deletePermanently = async (req, res) => {
    try {
        const courseId = req.params.courseId;
        await Course.deleteOne({ _id: courseId });
        res.json({
            code: 200,
            message: "Xóa vĩnh viễn khóa học thành công!"
        });
    } catch (error) {
        res.json({
            code: 400,
            message: "Xóa vĩnh viễn khóa học thất bại!"
        });
    };
};

//[PATCH] /api/admin/courses/trash/restore-multi
module.exports.restoreMulti = async (req, res) => {
    try {
        const { ids, key } = req.body;
        switch (key) {
            case 'restore':
                await Course.updateMany({
                    _id: { $in: ids }
                }, {
                    deleted: false
                });
                res.json({
                    code: 200,
                    message: "Khôi phục khóa học thành công!"
                })
                break;
            case 'delete':
                await Course.deleteMany({
                    _id: { $in: ids }
                });

                res.json({
                    code: 200,
                    message: "Xóa vĩnh viễn khóa học thành công!"
                });
                break;
            default:
                res.json({
                    code: 400,
                    message: "Khôi phục/xóa khóa học thất bại!"
                });
                break;
        };
    } catch (error) {
        res.json({
            code: 400,
            message: "Khôi phục/xóa khóa học thất bại!"
        });
    };
};