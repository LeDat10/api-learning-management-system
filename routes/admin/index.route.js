const courseRoutes = require("./course.route");
const sectionRoutes = require("./section.route");
const lessonRoutes = require('./lesson.route');
const categoryRoutes = require("./category.route");
const roleRoutes = require("./role.route");
const accountRoutes = require("./account.route");

const authMiddleware = require("../../middlewares/admin/auth.middleware");

module.exports = (app) => {
    const version = "/api/admin";

    app.use(version + "/courses", authMiddleware.requireAuth, courseRoutes);

    app.use(version + "/sections",authMiddleware.requireAuth, sectionRoutes);

    app.use(version + "/lessons", authMiddleware.requireAuth, lessonRoutes);

    app.use(version + "/category", authMiddleware.requireAuth, categoryRoutes);

    app.use(version + "/roles", authMiddleware.requireAuth, roleRoutes);

    app.use(version + "/accounts", accountRoutes);
};