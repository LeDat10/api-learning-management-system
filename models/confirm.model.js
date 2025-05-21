const mongoose = require("mongoose");

const confirmchema = new mongoose.Schema(
    {
        email: String,
        otp: String,
        expireAt: {
            type: Date, 
            expires: 420
        }
    },
    {
        timestamps: true
    }
);

const Confirm = mongoose.model("Confirm", confirmchema, "confirm");
module.exports = Confirm;