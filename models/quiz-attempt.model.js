const mongoose = require("mongoose");

const quizAttemptSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    lessonId: {
        type: String,
        required: true
    },
    quizId: {
        type: String,
        required: true
    },
    startedAt: {
        type: Date,
        default: Date.now
    },
    submittedAt: {
        type: Date
    },
    correctCount: Number,
    totalQuestions: Number,
    totalAnswers: Number,
    percentageScore: Number,
    score: {
        type: Number // Điểm số nếu đã chấm
    },
    status: {
        type: String,
        enum: ['in_progress', 'submitted'],
        default: 'in_progress'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("QuizAttempt", quizAttemptSchema, 'quiz-attempt');