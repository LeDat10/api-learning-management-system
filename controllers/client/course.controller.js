const Course = require("../../models/course.model");
const Section = require("../../models/section.model");
const Lesson = require("../../models/lesson.model");
const Enrollment = require("../../models/enrollment.model");

// [GET] /api/client/courses
module.exports.index = async (req, res) => {
    try {

        const find = {
            deleted: false,
            status: "active"
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
            if (req.query.sortKey === "title" && req.query.sortValue === "default") {
                sort.position = "desc";
            } else {
                sort[req.query.sortKey] = req.query.sortValue;
            }
        } else {
            sort.position = "desc";
        };
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

        //Category
        if (req.query.category) {
            const ids = req.query.category.split(",");
            find.categoryId = { "$in": ids };
        }
        //End Category

        const courses = await Course.find(find).select("title description thumbnail categoryId type slug").sort(sort).limit(objPagination.limit).skip(objPagination.skip).lean();
        const totalCourse = await Course.countDocuments({
            deleted: false,
            status: "active"
        });
        for (const course of courses) {
            const quantitySection = await Section.countDocuments({
                courseId: course._id,
                deleted: false,
                status: "active"
            }).lean();
            course.quantitySection = quantitySection;
        };

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

// [GET] /api/client/courses/:slugCourse
module.exports.detail = async (req, res) => {
    try {
        const slugCourse = req.params.slugCourse;
        const userId = req.user._id;
        const course = await Course.findOne({
            slug: slugCourse,
            status: "active",
            deleted: false
        }).select("categoryId description slug thumbnail title type code").lean();

        const sections = await Section.find({
            courseId: course._id,
            deleted: false,
            status: "active"
        }).select("title").lean();

        course.sections = sections;
        course.totalSections = sections.length;

        for (const section of course.sections) {
            const lessons = await Lesson.find({
                sectionId: section._id,
                deleted: false,
                status: "active"
            }).select("title");
            section.lessons = lessons;
        };

        const totalRegisterCourse = await Enrollment.countDocuments({
            courseId: course._id,
            userId: userId,
            status: "Enrolled"
        });

        course.totalRegisterCourse = totalRegisterCourse;

        const existingEnrollment = await Enrollment.findOne({
            courseId: course._id,
            userId: userId,
            status: "Enrolled"
        });

        course.isEnrolled = !!existingEnrollment;

        res.json({
            code: 200,
            message: "Lấy chi tiết khóa học thành công!",
            course: course
        });
    } catch (error) {
        res.json({
            code: 400,
            message: "Lấy chi tiết khóa học thất bại!"
        });
    };
};

