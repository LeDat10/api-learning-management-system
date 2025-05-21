const Category = require("../../models/category.model");

// [GET] /api/client/category
module.exports.index = async (req, res) => {
    try {
        const categories = await Category.find({
            deleted: false,
            status: "active"
        }).select("title slug descirption thumbnail");

        res.json({
            code: 200,
            message: "lấy danh sách danh mục thành công!",
            categories: categories
        });
    } catch (error) {
        res.json({
            code: 400,
            message: "Lấy danh sách danh mục thất bại!"
        });
    };
};