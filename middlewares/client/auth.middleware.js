const jwt = require("jsonwebtoken");
const User = require("../../models/user.model");
module.exports.requireAuth = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        if (!token) {
            return res.json({
                code: 401,
                message: "Không có token nào được cung cấp!"
            });
        };

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded) {
            res.json({
                code: 401,
                message: "Token không hợp lệ. Vui lòng đăng nhập lại!"
            });
            return;
        };

        const user = await User.findById(decoded.id);
        if (!user) {
            res.json({
                code: 401,
                message: "Tài khoản không tồn tại!"
            });
            return;
        };

        if (user.tokenVersion !== decoded.tokenVersion) {
            res.json({
                code: 401,
                message: "Token không hợp lệ. Vui lòng đăng nhập lại!"
            });
            return;
        };
        
        req.user = user;
        next();
    } catch (error) {
        res.json({
            code: 400,
            message: "Lỗi từ server"
        });
    };
};