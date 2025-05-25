const Enrollment = require("../../models/enrollment.model");
const Course = require("../../models/course.model");

// [POST] /api/client/enrollments/register
module.exports.registerEnrollment = async (req, res) => {
    try {
        const { courseId } = req.body;
        const userId = req.user._id;
        if (!courseId) {
            return res.json({
                code: 400,
                message: "Đăng ký khóa học thất bại!"
            });
        };

        const course = await Course.findById(courseId);

        if (!course) {
            return res.json({
                code: 400,
                message: "Khóa học không tồn tại!"
            });
        };

        if (!course.toggle) {
            return res.json({
                code: 400,
                message: "Khóa học đã khóa. Không thể đăng ký!"
            });
        };

        const existingEnrollment = await Enrollment.findOne({
            courseId: courseId,
            userId: userId,
            status: 'Enrolled'
        });

        if (existingEnrollment) {
            return res.json({
                code: 400,
                message: "Tài khoản này đã được đăng ký khóa học."
            });
        };

        const count = await Enrollment.countDocuments({
            courseId: courseId,
            userId: userId
        });

        const enrollment = new Enrollment({
            courseId: courseId,
            userId: userId,
            attempt: count + 1
        });

        await enrollment.save();

        return res.json({
            code: 200,
            message: "Đăng ký khóa học thành công!"
        });
    } catch (error) {
        return res.json({
            code: 400,
            message: "Đăng ký khóa học thất bại!"
        });
    };
};

// [POST] /api/client/enrollments/cancel
module.exports.cancelEnrollment = async (req, res) => {
    try {
        const { courseId } = req.body;
        const userId = req.user._id;

        const enrollment = await Enrollment.findOne({
            userId: userId,
            courseId: courseId,
            status: "Enrolled"
        });

        if (!enrollment) {
            return res.json({ code: 404, message: "Không tìm thấy lượt đăng ký để hủy." });
        }

        enrollment.status = "Cancelled";
        enrollment.cancelledAt = new Date();
        await enrollment.save();

        return res.json({
            code: 200,
            message: "Hủy đăng ký khóa học thành công!"
        })
    } catch (error) {
        return res.json({
            code: 400,
            message: "Hủy đăng ký khóa học thất bại!"
        });
    };
};

//[POST] /api/client/enrollments/code-register
module.exports.codeRegister = async (req, res) => {
    try {
        const code = req.body.code;
        const course = await Course.findOne({
            code: code
        });

        if (!course) {
            return res.json({
                code: 400,
                message: "Khóa học không tồn tại!"
            });
        };

        return res.json({
            code: 200,
            message: "Tìm thấy khóa học!",
            slugCourse: course.slug
        });

    } catch (error) {
        return res.json({
            code: 400,
            message: "Không tìm thấy khóa học!"
        });
    };
};