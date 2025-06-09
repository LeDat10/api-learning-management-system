const Answer = require("../../models/answers.model");
const Question = require("../../models/question.model");
const QuizAttempt = require("../../models/quiz-attempt.model");
const Quiz = require("../../models/quiz.model");

//[POST] /api/client/answers/save
module.exports.saveOrUpdateAnswer = async (req, res) => {
    try {
        const { attemptId, questionId, selectedAnswers } = req.body;

        await Answer.findOneAndUpdate(
            { attemptId, questionId }, // điều kiện tìm kiếm
            {
                selectedAnswers,             // cập nhật đáp án
                answeredAt: new Date()       // cập nhật thời điểm trả lời
            },
            {
                upsert: true,                // nếu không tìm thấy thì tạo mới
                new: true                    // trả về bản ghi sau khi update
            }
        );


        return res.json({
            code: 200,
            message: "Đáp án đã được cập nhật!"
        });
    } catch (error) {
        return res.json({
            code: 400,
            message: "Cập nhật đáp án thất bại!"
        });
    };
};

//[GET] /api/client/answers/:attemptId
module.exports.getAnswerByAttemptId = async (req, res) => {
    try {
        const attemptId = req.params.attemptId;

        const answers = await Answer.find({
            attemptId: attemptId
        }).select("questionId selectedAnswers");

        return res.json({
            code: 200,
            message: "Lấy câu hỏi đã lưu thành công!",
            answers: answers
        });
    } catch (error) {
        return res.json({
            code: 400,
            message: "Lấy câu hỏi đã lưu thất bại!"
        });
    };
};


//[POST] /api/client/answers/submited
module.exports.submitQuiz = async (req, res) => {
    try {
        const { attemptId } = req.body;

        const attempt = await QuizAttempt.findById(attemptId);
        if (!attempt) {
            return res.status(404).json({ code: 404, message: "Không tìm thấy lượt làm bài." });
        }

        const quiz = await Quiz.findById(attempt.quizId);
        if (!quiz) {
            return res.status(404).json({ code: 404, message: "Không tìm thấy quiz." });
        }

        const now = new Date();
        let isLate = false;
        const GRACE_PERIOD_MS = 60 * 1000; // cho phép nộp trễ 1phút

        if (quiz.endTime && now.getTime() > new Date(quiz.endTime).getTime() + GRACE_PERIOD_MS) {
            isLate = true;
        } else if (quiz.duration && attempt.startedAt) {
            const deadline = new Date(attempt.startedAt.getTime() + quiz.duration * 60 * 1000);
            if (now.getTime() > deadline.getTime() + GRACE_PERIOD_MS) isLate = true;
        }

        if (isLate) {
            return res.status(400).json({
                code: 400,
                message: "Bạn đã quá thời gian cho phép. Không thể nộp bài!"
            });
        }

        // Tính điểm như bình thường
        const answers = await Answer.find({ attemptId });
        const totalQuestions = await Question.countDocuments({ quizId: quiz._id });

        let correctCount = 0;

        for (const ans of answers) {
            const question = await Question.findById(ans.questionId);
            if (!question) continue;

            const correctAnswerIds = question.answers
                .filter(a => a.isCorrect)
                .map(a => a._id.toString());

            const selected = ans.selectedAnswers.map(id => id.toString());

            const isCorrect =
                correctAnswerIds.length === selected.length &&
                correctAnswerIds.every(id => selected.includes(id));

            if (isCorrect) correctCount++;
        }

        const score = Math.round((correctCount / totalQuestions) * 10 * 10) / 10;
        const percentageScore = Math.round((correctCount / totalQuestions) * 100);

        await QuizAttempt.findByIdAndUpdate(attemptId, {
            submittedAt: now,
            correctCount,
            totalQuestions,
            totalAnswers: answers.length,
            percentageScore,
            score,
            status: "submitted"
        });

        return res.json({
            code: 200,
            message: "Nộp bài thành công!"
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            code: 500,
            message: "Đã xảy ra lỗi khi nộp bài."
        });
    };
};

