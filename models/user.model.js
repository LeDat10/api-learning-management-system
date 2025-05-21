const mongoose = require("mongoose");

const userchema = new mongoose.Schema(
    {
        fullName: String,
        email: String,
        password: String,
        phone: String,
        avatar: {
            type: String,
            default: "https://res.cloudinary.com/dgzkzwb4z/image/upload/v1745937431/fpp2s2tkgwrrxz3ydiui.jpg"
        },
        isVerified: {
            type: Boolean,
            default: false
        },
        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "inactive"
        },
        tokenVersion: {
            type: Number,
            default: 0
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

const User = mongoose.model("User", userchema, "users");
module.exports = User;