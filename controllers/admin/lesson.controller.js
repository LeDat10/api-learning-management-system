const Lesson = require('../../models/lesson.model');
const Quiz = require("../../models/quiz.model");
const convertToSlugHelper = require("../../helper/convertToSlug");
const Question = require("../../models/question.model");

// [GET] /api/admin/lessons/:sectionId
module.exports.index = async (req, res) => {
    try {
        const sectionId = req.params.sectionId;
        const find = {
            sectionId: sectionId,
            deleted: false
        };
        // Search
        if (req.query.keyword) {
            const keywordRegex = new RegExp(req.query.keyword, "i");
            const stringSlug = convertToSlugHelper.convertToSlug(req.query.keyword);
            const stringSlugRegex = new RegExp(stringSlug, "i");
            find["$or"] = [
                { title: keywordRegex },
                { slug: stringSlugRegex }
            ];
        };
        //End Search

        // Status
        if (req.query.status) {
            find.status = req.query.status;
        };
        // End Status

        const sort = {};

        // Sort
        if (req.query.sortKey && req.query.sortValue) {
            sort[req.query.sortKey] = req.query.sortValue;
        } else {
            sort.position = "asc";
        }
        // End Sort

        // pagination
        const objPagination = {
            currentPage: 1,
            limit: 5
        };

        if (req.query.page) {
            objPagination.currentPage = parseInt(req.query.page);
        };

        if (req.query.limit) {
            objPagination.limit = parseInt(req.query.limit);
        }

        objPagination.skip = (objPagination.currentPage - 1) * objPagination.limit;
        // End pagination

        const lessons = await Lesson.find(find).sort(sort).limit(objPagination.limit).skip(objPagination.skip).lean();
        for (const lesson of lessons) {
            if (lesson.type === "quiz") {
                const quiz = await Quiz.findOne({
                    lessonId: lesson._id
                });
                if (quiz) {
                    const questions = await Question.find({
                        quizId: quiz._id
                    });
                    lesson.questions = questions
                };
            };
        };
        const totalLesson = await Lesson.countDocuments({
            sectionId: sectionId,
            deleted: false
        });
        res.json({
            code: 200,
            message: "Lấy danh sách bài học thành công!",
            lessons: lessons,
            totalLesson: totalLesson
        });

    } catch (error) {
        res.json({
            code: 200,
            message: "Lấy danh sách bài học thất bại!"
        });

    };
};

// [POST] /api/admin/lessons/create/:sectionId
module.exports.create = async (req, res) => {
    try {
        const sectionId = req.params.sectionId;
        if (req.body.position) {
            req.body.position = parseInt(req.body.position);
        } else {
            const count = await Lesson.countDocuments();
            req.body.position = count + 1;
        };

        const lesson = new Lesson({
            title: req.body.title,
            sectionId: sectionId,
            content: req.body.content,
            status: req.body.status,
            type: req.body.type,
            position: req.body.position
        });
        await lesson.save();

        if (req.body.type === "quiz") {
            const lessonId = lesson._id;
            const quiz = new Quiz({
                lessonId: lessonId,
                startTime: req.body.startTime,
                endTime: req.body.endTime,
                duration: req.body.duration,
                maxAttempts: req.body.maxAttempts
            });

            await quiz.save();

            if (quiz._id) {
                for (const question of req.body.questions) {
                    question.quizId = quiz._id;
                };

                await Question.insertMany(req.body.questions);
            };
        };

        res.json({
            code: 200,
            message: "Thêm bài học mới thành công!"
        });
    } catch (error) {
        res.json({
            code: 400,
            message: "Thêm bài học mới thất bại!"
        });
    };
};

// [PATCH] /api/admin/lessons/:sectionId/change-multi
module.exports.changeMulti = async (req, res) => {
    try {
        const { ids, key } = req.body;
        const sectionId = req.params.sectionId;
        switch (key) {
            case 'active':
                await Lesson.updateMany({
                    _id: { $in: ids },
                    sectionId: sectionId
                }, {
                    status: "active"
                });
                res.json({
                    code: 200,
                    message: "Cập nhật trạng thái hoạt động thành công!"
                });
                break;
            case 'inactive':
                await Lesson.updateMany({
                    _id: { $in: ids },
                    sectionId: sectionId
                }, {
                    status: "inactive"
                });
                res.json({
                    code: 200,
                    message: "Cập nhật trạng thái dừng hoạt động thành công!"
                });
                break;
            case 'position':
                for (const item of ids) {
                    let [id, position] = item.split('-');
                    if (id && position) {
                        await Lesson.updateOne({
                            _id: id,
                            sectionId: sectionId
                        }, {
                            position: position
                        });
                    };
                };
                res.json({
                    code: 200,
                    message: "Cập nhật vị trí bài học thành công!"
                });
                break;
            case 'delete-all':
                await Lesson.updateMany({
                    _id: { $in: ids },
                    sectionId: sectionId
                }, {
                    deleted: true
                });
                res.json({
                    code: 200,
                    message: "Xóa nhiều bài học thành công!"
                });
                break;
            default:
                res.json({
                    code: 400,
                    message: "Cập nhật nhiều bài học thất bại!"
                });
                break;
        };
    } catch (error) {
        res.json({
            code: 400,
            message: "Cập nhật nhiều bài học thất bại!"
        });
    };
};

//[PATCH] /api/admin/lessons/:sectionId/change-status/:lessonId
module.exports.changeStatus = async (req, res) => {
    try {
        const sectionId = req.params.sectionId;
        const lessonId = req.params.lessonId;
        const status = req.body.status;
        await Lesson.updateOne({
            sectionId: sectionId,
            _id: lessonId,
            deleted: false
        }, {
            status: status
        });

        res.json({
            code: 200,
            message: "Cập nhật trạng thái bài học thành công!"
        });
    } catch (error) {
        res.json({
            code: 400,
            message: "Cập nhật trạng thái bài học thất bại!"
        });
    };
};

// [PATCH] /api/admin/lessons/:sectionId/edit/:lessonId
module.exports.edit = async (req, res) => {
    try {
        const { sectionId, lessonId } = req.params;

        if (req.body.position) {
            req.body.position = parseInt(req.body.position);
        }

        await Lesson.updateOne({ _id: lessonId, sectionId: sectionId }, req.body);

        // Nếu là dạng quiz thì xử lý thêm
        if (req.body.type === "quiz") {
            // Kiểm tra tồn tại quiz đã có hay chưa
            let quiz = await Quiz.findOne({ lessonId: lessonId });

            // Nếu chưa có thì tạo mới, còn có rồi thì update
            if (!quiz) {
                quiz = new Quiz({
                    lessonId: lessonId,
                    startTime: req.body.startTime,
                    endTime: req.body.endTime,
                    duration: req.body.duration,
                    maxAttempts: req.body.maxAttempts
                });
                await quiz.save();
            } else {
                quiz.startTime = req.body.startTime;
                quiz.endTime = req.body.endTime;
                quiz.duration = req.body.duration;
                quiz.maxAttempts = req.body.maxAttempts;
                await quiz.save();
            };

            const questions = req.body.questions;
            if (!Array.isArray(questions)) {
                return res.json({
                    code: 400,
                    message: "Dữ liệu câu hỏi không hợp lệ"
                });
            }

            // Gán quizId cho từng câu hỏi
            const bulkOps = questions.map((q) => {
                if (q._id) {
                    return {
                        updateOne: {
                            filter: { _id: q._id },
                            update: {
                                $set: {
                                    content: q.content,
                                    questionType: q.questionType,
                                    answers: q.answers,
                                    explanation: q.explanation || "",
                                    image: q.image || "",
                                    quizId: quiz._id
                                }
                            }
                        }
                    };
                } else {
                    return {
                        insertOne: {
                            document: {
                                quizId: quiz._id,
                                content: q.content,
                                questionType: q.questionType,
                                answers: q.answers,
                                explanation: q.explanation || "",
                                image: q.image || ""
                            }
                        }
                    };
                }
            });

            await Question.bulkWrite(bulkOps);
        }

        res.json({
            code: 200,
            message: "Cập nhật bài học thành công!"
        });
    } catch (error) {
        console.error(error);
        res.json({
            code: 400,
            message: "Cập nhật bài học thất bại!"
        });
    }
};


// [GET] /api/admin/lessons/:sectionId/detail/:lessonId
module.exports.detail = async (req, res) => {
    try {
        const { sectionId, lessonId } = req.params;

        // Lấy lesson theo section và lessonId
        const lesson = await Lesson.findOne({
            _id: lessonId,
            sectionId: sectionId
        }).lean();

        if (!lesson) {
            return res.status(404).json({
                code: 404,
                message: "Không tìm thấy bài học!"
            });
        }

        if (lesson.type === "quiz") {
            // Lấy quiz theo lessonId
            const quiz = await Quiz.findOne({ lessonId: lesson._id }).lean();

            if (quiz) {
                // Lấy câu hỏi theo quizId
                const questions = await Question.find({
                    quizId: quiz._id
                }).lean();
                lesson.questions = questions;
                lesson.startTime = quiz.startTime;
                lesson.endTime = quiz.endTime;
                lesson.duration = quiz.duration;
                lesson.maxAttempts = quiz.maxAttempts;
            } else {
                // Nếu không tìm thấy quiz, gán questions rỗng
                lesson.questions = [];
            }
        }

        return res.json({
            code: 200,
            message: "Lấy chi tiết bài học thành công!",
            lesson: lesson
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            code: 500,
            message: "Lấy chi tiết bài học thất bại!"
        });
    }
};


// [DELETE] /api/admin/lessons/:sectionId/delete/:lessonId
module.exports.delete = async (req, res) => {
    try {
        const { sectionId, lessonId } = req.params;
        await Lesson.updateOne({
            _id: lessonId,
            sectionId: sectionId
        }, {
            deleted: true
        });

        res.json({
            code: 200,
            message: "Xóa bài học thành công!"
        });
    } catch (error) {
        res.json({
            code: 400,
            message: "Xóa bài học thất bại!"
        });
    };
};

// [GET] /api/admin/lessons/:sectionId/trash
module.exports.trash = async (req, res) => {
    try {
        const sectionId = req.params.sectionId;
        const find = {
            sectionId: sectionId,
            deleted: true
        };

        // Search
        if (req.query.keyword) {
            const keywordRegex = new RegExp(req.query.keyword, "i");
            const stringSlug = convertToSlugHelper.convertToSlug(req.query.keyword);
            const stringSlugRegex = new RegExp(stringSlug, "i");
            find["$or"] = [
                { title: keywordRegex },
                { slug: stringSlugRegex }
            ];
        };
        //End Search

        const sort = {};
        // Sort
        if (req.query.sortKey && req.query.sortValue) {
            sort[req.query.sortKey] = req.query.sortValue;
        } else {
            sort.title = "asc";
        }
        // End Sort


        // pagination
        const objPagination = {
            currentPage: 1,
            limit: 5
        };

        if (req.query.page) {
            objPagination.currentPage = parseInt(req.query.page);
        };

        if (req.query.limit) {
            objPagination.limit = parseInt(req.query.limit);
        }

        objPagination.skip = (objPagination.currentPage - 1) * objPagination.limit;
        // End pagination

        const lessons = await Lesson.find(find).sort(sort).limit(objPagination.limit).skip(objPagination.skip).lean();
        for (const lesson of lessons) {
            if (lesson.type === "quiz") {
                const questions = await Question.find({
                    lessonId: lesson._id
                });
                lesson.questions = questions;
            };
        };
        const totalLesson = await Lesson.countDocuments({
            deleted: true
        });

        res.json({
            code: 200,
            message: "Lấy bài học đã xóa thành công!",
            lessons: lessons,
            totalLesson: totalLesson
        });
    } catch (error) {
        res.json({
            code: 400,
            message: "Lấy bài học đã xóa thất bại!"
        });
    };
};

//[DELETE] /api/admin/lessons/:sectionId/trash/delete/:lessonId
module.exports.deletePermanentlyText = async (req, res) => {
    try {
        const { sectionId, lessonId } = req.params;
        await Lesson.deleteOne({
            _id: lessonId,
            sectionId: sectionId
        });
        res.json({
            code: 200,
            message: "Xóa vĩnh viễn bài học thành công!"
        });
    } catch (error) {
        res.json({
            code: 400,
            message: "Xóa vĩnh viễn bài học thất bại!"
        });
    };
};

//[PATCH] /api/admin/lessons/:sectionId/trash/restore/:lessonId
module.exports.restore = async (req, res) => {
    try {
        const { sectionId, lessonId } = req.params;
        await Lesson.updateOne({
            _id: lessonId,
            sectionId: sectionId
        }, {
            deleted: false
        });

        res.json({
            code: 200,
            message: "Khôi phục bài học thành công!"
        });

    } catch (error) {
        res.json({
            code: 400,
            message: "Khôi phục bài học thất bại!"
        });
    };
};

//[PATCH] /api/admin/lessons/:sectionId/trash/restore-multi
module.exports.restoreMulti = async (req, res) => {
    try {
        const { ids, key } = req.body;
        const sectionId = req.params.sectionId;
        switch (key) {
            case 'restore':
                await Lesson.updateMany({
                    _id: { $in: ids },
                    sectionId: sectionId
                }, {
                    deleted: false
                });
                res.json({
                    code: 200,
                    message: "Khôi phục bài học thành công!"
                })
                break;
            case 'delete':
                await Lesson.deleteMany({
                    _id: { $in: ids },
                    sectionId: sectionId
                });

                res.json({
                    code: 200,
                    message: "Xóa vĩnh viễn bài học thành công!"
                });
                break;
            default:
                res.json({
                    code: 400,
                    message: "Khôi phục/xóa bài học thất bại!"
                });
                break;
        };
    } catch (error) {
        res.json({
            code: 400,
            message: "Khôi phục/xóa bài học thất bại!"
        });
    };
};