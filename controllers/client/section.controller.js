const Section = require("../../models/section.model");
//[GET] /api/client/sections/:courseId/detail/:sectionId

module.exports.detail = async (req, res) => {
    try {
        const { courseId, sectionId } = req.params;
        if (!courseId || !sectionId) {
            return res.json({
                code: 400,
                message: "Không tìm thấy chương!"
            });
        };

        const section = await Section.findOne({
            courseId: courseId,
            _id: sectionId,
            status: "active",
            deleted: false
        }).select("title description");

        return res.json({
            code: 200,
            message: "Lấy nội dung chương thành công!",
            section: section
        });
    } catch (error) {
        return res.json({
            code: 400,
            message: "Không tìm thấy chương!"
        });
    };
};