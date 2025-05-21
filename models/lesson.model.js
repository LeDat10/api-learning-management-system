const mongoose = require("mongoose");
const slug = require("mongoose-slug-updater");
mongoose.plugin(slug);

const lessonSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        sectionId: String,
        content: String,
        status: {
            type: String,
            enum: ["active", "inactive"],
            required: true
        },
        type: {
            type: String,
            enum: ["quiz", "assignment", "text"],
            required: true
        },
        position: Number,
        slug: {
            type: String,
            slug: "title",
            unique: true
        },
        deleted: {
            type: Boolean,
            default: false
        },
        deletedAt: Date
    },
    {
        timestamps: true
    }
);

const Lesson = mongoose.model("Lesson", lessonSchema, "lessons");
module.exports = Lesson;