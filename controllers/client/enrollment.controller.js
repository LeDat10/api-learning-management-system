const Enrollment = require("../../models/enrollment.model");

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