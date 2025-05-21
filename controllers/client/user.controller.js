const User = require("../../models/user.model");
const Confirm = require("../../models/confirm.model");
const jwt = require("jsonwebtoken");
const argon2 = require("argon2");

const generateHelper = require("../../helper/generate");
const sendOtpEmailHelper = require("../../helper/sendOtpEmail");

// [POST] /api/client/users/register
module.exports.register = async (req, res) => {
    try {
        const { email, password, phone } = req.body;
        const existingUser = await User.findOne({
            email: email,
            deleted: false
        });



        if (existingUser && existingUser.isVerified && existingUser.status === "active") {
            return res.status(409).json({
                code: 409,
                message: "Email này đã được đăng ký!"
            });
        }

        if (existingUser && !existingUser.isVerified && existingUser.status === "inactive") {
            const otp = generateHelper.generateRadomNumber(6);

            const hashedPassword = await argon2.hash(password);

            await User.updateOne({
                _id: existingUser._id
            }, {
                password: hashedPassword,
                phone: phone
            });

            await Confirm.create({
                email: email,
                otp: otp,
                expireAt: Date.now()
            });

            sendOtpEmailHelper.sendOtpEmail(email, otp);
            return res.json({
                code: 200,
                message: "OTP đã được gửi về email đăng ký. Vui lòng xác thực tài khoản!",
                email: existingUser.email
            });
        };

        const hashedPassword = await argon2.hash(password);
        const newUser = await User.create({
            email: email,
            password: hashedPassword,
            phone: phone
        });

        const otp = generateHelper.generateRadomNumber(6);

        await Confirm.create({
            email: email,
            otp: otp,
            expireAt: Date.now()
        });

        sendOtpEmailHelper.sendOtpEmail(email, otp);

        return res.json({
            code: 200,
            message: "OTP đã được gửi về email đăng ký. Vui lòng xác thực tài khoản!",
            email: newUser.email
        });
    } catch (error) {
        return res.json({
            code: 500,
            message: "Đăng ký tài khoản thất bại!"
        });
    };
};

// [POST] /api/client/users/confirmOTP
module.exports.confirmOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const userConfirm = await Confirm.findOne({
            email: email,
            otp: otp
        });

        if (!userConfirm) {
            return res.json({
                code: 400,
                message: "Mã OTP không hợp lệ hoặc đã hết hạn!"
            });
        };

        await User.updateOne({
            email: email
        }, {
            status: "active",
            isVerified: true
        });

        return res.json({
            code: 200,
            message: "Xác thực và đăng ký tài khoản thành công!"
        });
    } catch (error) {
        return res.json({
            code: 400,
            message: "Xác thực và đăng ký tài khoản thất bại!"
        });
    };
};

// [POST] /api/client/users/login
module.exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({
            email: email,
            deleted: false,
            status: "active",
            isVerified: true
        });

        if (!user) {
            return res.json({
                code: 400,
                message: "Email đăng nhập không tồn tại!"
            });
        };

        const match = await argon2.verify(user.password, password);

        if (!match) {
            return res.json({
                code: 400,
                message: "Mật khẩu đăng nhập không đúng!"
            });
        };

        const payload = {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            tokenVersion: user.tokenVersion,
        };

        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRE
            }
        );

        return res.json({
            code: 200,
            message: "Đăng nhập thành công!",
            token: token
        });
    } catch (error) {
        return res.json({
            code: 400,
            message: "Đăng nhập thất bại!"
        });
    };
};
