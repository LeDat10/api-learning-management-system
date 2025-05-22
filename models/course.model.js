const mongoose = require("mongoose");
const slug = require("mongoose-slug-updater");
mongoose.plugin(slug);

const courseSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        code: {
            type: String,
            required: true
        },
        categoryId: {
            type: String,
            default: ""
        },
        description: String,
        thumbnail: String,
        toggle: {
            type: Boolean,
            default: true,
        },
        type: {
            type: String,
            enum: ["free", "premium"],
            required: true
        },
        status: {
            type: String,
            enum: ["active", "inactive"],
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

const Course = mongoose.model("Course", courseSchema, "courses");
module.exports = Course;