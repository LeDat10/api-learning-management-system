const courseRoutes = require("./course.route");
const categoryRoutes = require("./category.route");
const userRoutes = require("./user.route");
const enrollmentRoutes = require("./enrollment.route");
const sectionRoutes = require("./section.route");
const lessonRoutes = require("./lesson.route");
const quizAttemptRoutes = require("./quiz-attempt.route");
const questionRoutes = require("./question.route");
const answerRoutes = require("./answer.route");

const authMiddleware = require("../../middlewares/client/auth.middleware");

module.exports = (app) => {
    const version = "/api/client";

    app.use(version + "/courses", authMiddleware.requireAuth, courseRoutes);

    app.use(version + "/category", authMiddleware.requireAuth, categoryRoutes);

    app.use(version + "/users", userRoutes);

    app.use(version + "/enrollments", authMiddleware.requireAuth, enrollmentRoutes);

    app.use(version + "/sections", authMiddleware.requireAuth, sectionRoutes);

    app.use(version + "/lessons", authMiddleware.requireAuth, lessonRoutes);

    app.use(version + "/quiz-attempts", authMiddleware.requireAuth, quizAttemptRoutes);

    app.use(version + "/questions", authMiddleware.requireAuth, questionRoutes);

    app.use(version + "/answers", authMiddleware.requireAuth, answerRoutes);

};