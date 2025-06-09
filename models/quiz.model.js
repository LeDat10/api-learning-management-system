const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema(
    {
        lessonId: {
            type: String,
            required: true
        },
        // Thời lượng làm bài (tính bằng phút)
        duration: {
            type: Number,
            required: true
        },
        maxAttempts: {
            type: Number,
            default: 1
        },
        startTime: {
            type: Date,
            required: true // hoặc false nếu không bắt buộc
        },
        endTime: {
            type: Date,
            required: true // hoặc false nếu không bắt buộc
        },
    },
    {
        timestamps: true
    }
);

const Quiz = mongoose.model("Quiz", quizSchema, "quiz");
module.exports = Quiz;