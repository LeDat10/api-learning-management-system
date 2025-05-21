const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true
        },
        courseId: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: ["Enrolled", "Cancelled"],
            default: 'Enrolled'
        },
        enrolledAt: {
            type: Date,
            default: Date.now()
        },
        cancelledAt: Date,
        attempt: {
            type: Number,
            default: 1
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

const Enrollment = mongoose.model("Enrollment", enrollmentSchema, "enrollments");
module.exports = Enrollment;