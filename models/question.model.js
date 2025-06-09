const mongoose = require("mongoose");
const slug = require("mongoose-slug-updater");

mongoose.plugin(slug);

const questionSchema = new mongoose.Schema(
    {
        quizId: {
            type: String,
            required: true
        },
        content: {
            type: String,
            required: true
        },
        questionType: {
            type: String,
            enum: ['single', "multiple", 'short_answer'],
            required: true
        },
        answers: [
            {
                text: { type: String, required: true },
                isCorrect: { type: Boolean, default: false }
            }
        ],
        explanation: String,
        image: String,
        deleted: {
            type: Boolean,
            default: false
        },
        deletedAt: {
            type: Date,
            default: Date.now()
        }
    },
    {
        timestamps: true
    }
);

const Question = mongoose.model("Question", questionSchema, "questions");
module.exports = Question;