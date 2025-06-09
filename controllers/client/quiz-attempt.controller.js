const QuizAttempt = require("../../models/quiz-attempt.model");
const Quiz = require("../../models/quiz.model");

// [POST] /api/client/quiz-attempts
module.exports.createQuizAttempt = async (req, res) => {
    try {
        const { lessonId } = req.body;
        const userId = req.user._id;

        const quiz = await Quiz.findOne({
            lessonId: lessonId
        });

        const now = new Date();

        if (quiz.startTime && now < quiz.startTime) {
            return res.json({
                code: 400,
                message: "Chưa đến thời gian làm bài."
            });
        }

        if (quiz.endTime && now > quiz.endTime) {
            return res.json({
                code: 400,
                message: "Đã quá thời gian cho phép làm bài."
            });
        }

        // Kiểm tra số lượt làm đã vượt quá maxAttempts chưa
        const attemptCount = await QuizAttempt.countDocuments({
            userId,
            lessonId,
            quizId: quiz._id
        });

        if (quiz.maxAttempts && attemptCount >= quiz.maxAttempts) {
            return res.json({
                code: 400,
                message: `Bạn đã vượt quá số lượt làm bài (${quiz.maxAttempts} lần).`
            });
        }

        const existing = await QuizAttempt.findOne({
            userId,
            lessonId,
            quizId: quiz._id,
            status: "in_progress",
        });

        if (existing) {
            return res.json({
                code: 200,
                message: "Gửi lại id lượt làm cũ",
                attemptId: existing._id
            }); // Gửi lại attempt cũ nếu có
        }

        // Tạo mới lượt làm bài
        const attempt = new QuizAttempt({
            userId,
            lessonId,
            quizId: quiz._id,
        });

        await attempt.save();

        return res.json({
            code: 200,
            message: "Tạo lượt làm mới thành công!",
            attemptId: attempt._id
        });
    } catch (error) {
        return res.json({
            code: 500,
            message: "Lỗi khi tạo lượt làm bài."
        });
    };
};

// //[GET] /api/client/quiz-attempts/info/:lessonId
// module.exports.infoAttempt = async (req, res) => {
//     try {
//         const userId = req.user._id;
//         const lessonId = req.params.lessonId;

//         const quiz = await Quiz.findOne({
//             lessonId: lessonId
//         });

//         if (!quiz) {
//             return res.json({
//                 code: 400,
//                 message: "Không tìm thấy quiz."
//             });
//         };

//         const count = await QuizAttempt.countDocuments({
//             userId: userId,
//             lessonId: lessonId,
//             quizId: quiz._id,
//             status: "submitted"
//         });

//         const attempt = await QuizAttempt.findOne({ userId, lessonId, quizId: quiz._id, status: 'submitted' })
//             .select("startedAt submittedAt score percentageScore totalQuestions totalAnswers correctCount ")
//             .sort({ submittedAt: -1 })
//             .lean();

//         attempt.duration = quiz.duration;
//         attempt.startTime = quiz.startTime;
//         attempt.endTime = quiz.endTime;
//         attempt.maxAttempts = quiz.maxAttempts;
//         attempt.count = count;

//         return res.json({
//             code: 200,
//             message: "Lấy thông tin thành công!",
//             attempt: attempt
//         });
//     } catch (error) {
//         return res.json({
//             code: 400,
//             message: "Lấy thông tin thất bại!"
//         });
//     };
// };