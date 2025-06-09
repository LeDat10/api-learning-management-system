const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema({
    attemptId: {
        type: String,
        required: true
    },
    questionId: {
        type: String,
        required: true
    },
    selectedAnswers: [
        {
            type: String // hoặc ObjectId nếu bạn tham chiếu đến đáp án có sẵn
        }
    ],
    answeredAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Answer", answerSchema);

