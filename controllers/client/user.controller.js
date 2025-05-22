const User = require("../../models/user.model");
const Confirm = require("../../models/confirm.model");
const jwt = require("jsonwebtoken");
const argon2 = require("argon2");

const generateHelper = require("../../helper/generate");
const sendOtpEmailHelper = require("../../helper/sendOtpEmail");
const sendMailHelper = require("../../helper/sendMail");

// [POST] /api/client/users/register
module.exports.register = async (req, res) => {
    try {
        const { email, password, phone, fullName } = req.body;
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
                phone: phone,
                fullName: fullName
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
            phone: phone,
            fullName: fullName
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

// [GET] /api/client/users/detail
module.exports.detail = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findOne({
            _id: userId,
            status: 'active',
            isVerified: true,
            deleted: false
        }).select("fullName email avatar phone");

        if (!user) {
            return res.json({
                code: 400,
                message: "Không tìm thấy thông tin người dùng!"
            });
        };

        return res.json({
            code: 200,
            message: "Lấy thông tin người dùng thành công!",
            user: user
        });
    } catch (error) {
        return res.json({
            code: 400,
            message: "Lấy thông tin người dùng thất bại!"
        });
    };
};

// [POST] /api/client/users/logout
module.exports.logout = async (req, res) => {
    try {
        const userId = req.user._id;
        await User.updateOne({
            _id: userId,
            deleted: false,
            isVerified: true,
            status: "active"
        }, { $inc: { tokenVersion: 1 } });

        return res.json({
            code: 200,
            message: "Đăng xuất tài khoản thành công!"
        });
    } catch (error) {
        return res.json({
            code: 400,
            message: "Đăng xuất tài khoản thất bại!"
        });
    };
};

// [POST] /api/client/users/password/forgot
module.exports.forgot = async (req, res) => {
    try {
        const email = req.body.email;
        const existingUser = await User.findOne({
            email: email,
            deleted: false,
            status: "active",
            isVerified: true
        });

        if (!existingUser) {
            return res.json({
                code: 404,
                message: "Email không tồn tại hoặc chưa được xác thực!"
            });
        };

        const otp = generateHelper.generateRadomNumber(6);

        const forgotPassword = Confirm({
            email: email,
            otp: otp,
            expireAt: Date.now()
        });
        await forgotPassword.save();

        const subject = `Mã OTP xác minh đặt lại mật khẩu`;

        const html = `<div style="font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 480px; margin: auto; background-color: #ffffff; padding: 32px; border-radius: 10px; border: 1px solid #e0e0e0; box-shadow: 0 2px 6px rgba(0,0,0,0.05); color: #333;">
                        <h2 style="margin-top: 0; font-weight: 600; color: #2c3e50;">🔐 Đặt lại mật khẩu</h2>
                        <p>Xin chào,</p>
                        <p>Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Vui lòng sử dụng mã OTP dưới đây để tiếp tục quá trình:</p>

                        <div style="font-size: 28px; font-weight: bold; color: #1565c0; background-color: #e3f2fd; padding: 12px 24px; display: inline-block; border-radius: 6px; letter-spacing: 4px; margin: 20px 0;">
                            ${otp}
                        </div>

                        <p style="margin-top: 20px;"><strong>Lưu ý:</strong> Mã OTP có hiệu lực trong <strong>5 phút</strong>. Không chia sẻ mã này với bất kỳ ai.</p>
                        <p>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.</p>

                        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">

                        <p style="font-size: 14px; color: #888;">Trân trọng,</p>
                        <p style="font-size: 14px; color: #888;"><strong>Đội ngũ hỗ trợ - [Tên hệ thống của bạn]</strong></p>
                    </div>`;
        sendMailHelper.sendMail(email, subject, html);

        return res.json({
            code: 200,
            message: "Mã OTP đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư.",
            email: existingUser.email
        });
    } catch (error) {
        return res.json({
            code: 400,
            message: 'Không thể gửi email. Vui lòng thử lại sau.'
        });
    };
};

// [POST] /api/client/users/password/otp
module.exports.otpPassword = async (req, res) => {
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

        const token = jwt.sign(
            { email: userConfirm.email },
            process.env.JWT_SECRET,
            { expiresIn: "15m" }
        );

        const resetLink = `http://localhost:3000/users/password/reset-password?token=${token}`;

        const subject = 'Yêu cầu đặt lại mật khẩu';

        const html = `<p>Bạn đã yêu cầu đặt lại mật khẩu.</p>
             <p>Nhấn vào link sau để tiếp tục:</p>
             <a href="${resetLink}">Đặt lại mật khẩu</a>
             <p>Link này chỉ có hiệu lực trong 15 phút.</p>`;

        sendMailHelper.sendMail(email, subject, html);

        return res.json({
            code: 200,
            message: "Email đặt lại mật khẩu đã được gửi."
        });
    } catch (error) {
        return res.json({
            code: 400,
            message: 'Không thể gửi email. Vui lòng thử lại sau.'
        });
    };
};

// [POST] /api/client/users/password/reset-password
module.exports.resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ email: decoded.email });

        if (!user) return res.json({
            code: 400,
            message: "Người dùng không tồn tại"
        });

        const isSame = await argon2.verify(user.password, newPassword);

        if (isSame) {
            return res.json({
                code: 400,
                message: "Mật khẩu mới không được trùng mật khẩu cũ"
            });
        };

        const hashedPassword = await argon2.hash(newPassword);
        user.password = hashedPassword;
        await user.save();

        return res.json({
            code: 200,
            message: "Đặt lại mật khẩu thành công"
        });
    } catch (error) {
        return res.json({
            code: 400,
            message: "Token không hợp lệ hoặc đã hết hạn"
        });
    };
};
