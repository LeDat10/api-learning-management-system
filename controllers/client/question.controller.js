const Question = require("../../models/question.model");
const Quiz = require("../../models/quiz.model");
const QuizAttempt = require("../../models/quiz-attempt.model");

//[GET] /api/client/questions/:lessonId/:attemptId
module.exports.questions = async (req, res) => {
    try {
        const { lessonId, attemptId } = req.params;

        const userId = req.user._id;

        const quiz = await Quiz.findOne({
            lessonId: lessonId
        });

        const quizAttempt = await QuizAttempt.findOne({
            _id: attemptId,
            userId: userId,
            lessonId: lessonId,
            quizId: quiz._id,
            status: 'in_progress'
        });

        if (!quizAttempt) {
            return res.json({
                code: 400,
                message: "Không tìm thấy lượt làm bài."
            })
        }

        const questions = await Question.find({
            quizId: quiz._id
        }).lean();

        for (const question of questions) {
            question.answers.forEach(answer => {
                delete answer.isCorrect;
            });
        };

        return res.json({
            code: 200,
            message: "Lấy câu hỏi thành công!",
            data: {
                questions: questions,
                duration: quiz.duration,
                startedAt: quizAttempt.startedAt
            }
        });
    } catch (error) {
        return res.json({
            code: 400,
            message: "Lấy câu hỏi thất bại!"
        });
    };
};