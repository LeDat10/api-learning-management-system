const mongoose = require("mongoose");
const slug = require("mongoose-slug-updater");
mongoose.plugin(slug);

const sectionSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        courseId: String,
        description: String,
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

const Section = mongoose.model("Section", sectionSchema, "sections");
module.exports = Section;