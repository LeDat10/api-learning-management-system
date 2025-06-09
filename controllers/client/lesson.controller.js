const Lesson = require("../../models/lesson.model");
const Question = require("../../models/question.model");
const Quiz = require("../../models/quiz.model");
const QuizAttempt = require("../../models/quiz-attempt.model");

//[GET] /api/client/lessons/:sectionId/detail/:lessonId
module.exports.detail = async (req, res) => {
    try {
        const { sectionId, lessonId } = req.params;
        const userId = req.user._id;
        if (!sectionId || !lessonId) {
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
        }).select("title content type").lean();

        if (lesson.type === "quiz") {
            const quiz = await Quiz.findOne({
                lessonId: lesson._id
            });
            if (quiz) {
                const totalQuestions = await Question.countDocuments({
                    quizId: quiz._id
                });

                const attempt = await QuizAttempt.countDocuments({
                    userId: userId,
                    lessonId: lessonId,
                    quizId: quiz._id,
                    status: "submitted"
                });

                lesson.totalQuestions = totalQuestions;
                lesson.duration = quiz.duration;
                lesson.startTime = quiz.startTime;
                lesson.endTime = quiz.endTime;
                lesson.maxAttempts = quiz.maxAttempts;
                lesson.attempt = attempt;

                const attemptInfo = await QuizAttempt.findOne({ userId, lessonId, quizId: quiz._id, status: 'submitted' })
                    .select("startedAt submittedAt score percentageScore totalQuestions totalAnswers correctCount ")
                    .sort({ submittedAt: -1 })
                    .lean();

                if (attemptInfo) {
                    lesson.score = attemptInfo.score;
                    lesson.percentageScore = attemptInfo.percentageScore;
                    lesson.totalAnswers = attemptInfo.totalAnswers;
                    lesson.correctCount = attemptInfo.correctCount;
                }
            };
        };

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