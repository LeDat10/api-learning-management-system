const jwt = require("jsonwebtoken");
const Account = require("../../models/account.model");
module.exports.requireAuth = async (req, res, next) => {
    try {
        // if (req.headers && req.headers.authorization) {
        //     const token = req.headers.authorization.split(" ")[1];
        //     jwt.verify(token, process.env.JWT_SECRET, async (error, account) => {
        //         if (error) {
        //             res.json({
        //                 code: 400,
        //                 message: "Token không đúng hoặc đã hết hạn!"
        //             });
        //             return;
        //         };

        //         const infoAccount = await Account.findOne({
        //             _id: account.id
        //         }).select("fullName email avatar phone status role_id slug");
        //         if (!infoAccount) {
        //             res.json({
        //                 code: 400,
        //                 message: "Tài khoản không tồn tại!"
        //             });
        //             return;
        //         };

        //         if(!infoAccount.tokenVersion !== account.tokenVersion) {
        //             return res.json({
        //                 code: 401,
        //                 message: "Token không hợp lệ. Vui lòng đăng nhập lại!"
        //             });
        //         };

        //         req.user = infoAccount;
        //         next();
        //     });
        // } else {
        //     res.json({
        //         code: 400,
        //         message:"Vui lòng gửi kèm token!"
        //     });
        // };

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

        const account = await Account.findById(decoded.id);
        // console.log(account);
        if (!account) {
            res.json({
                code: 401,
                message: "Tài khoản không tồn tại!"
            });
            return;
        };

        if (account.tokenVersion !== decoded.tokenVersion) {
            res.json({
                code: 401,
                message: "Token không hợp lệ. Vui lòng đăng nhập lại!"
            });
            return;
        };

        // console.log(account.tokenVersion !== decoded.tokenVersion);

        req.account = account;
        next();
    } catch (error) {
        res.json({
            code: 400,
            message: "Lỗi từ server"
        });
    };
};