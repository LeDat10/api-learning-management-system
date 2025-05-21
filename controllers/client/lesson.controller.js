const Lesson = require("../../models/lesson.model");

//[GET] /api/client/lessons/:sectionId/detail/:lessonId
module.exports.detail = async (req, res) => {
    try {
        const {sectionId, lessonId} = req.params;
        if(!sectionId || !lessonId) {
            return res.json({
                code: 400,
                message: "Không tìm thấy bài học!"
            });
        };

        const lesson = await Lesson.findOne({
            _id: lessonId,
            sectionId: sectionId,
            deleted: false,
            status: "active"
        }).select("title content type");
        return res.json({
            code: 200,
            message: "Lấy nội dung bài học thàn công!",
            lesson: lesson
        });
    } catch (error) {
        return res.json({
            code: 400,
            message: "Không tìm thấy bài học"
        });
    };
};