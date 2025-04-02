const { Router } = require("express");
const { CourseModel, PurchaseModel } = require("../db");
const { userAuth } = require("../middleware/user");
const courseRouter = Router();

courseRouter.get("/purchase", userAuth, async (req, res) => {
  const userId = req.userId;
  const courses = await PurchaseModel.find({
    userId,
  });

  if (!courses) {
    res.status(404).json({
      Error: `not found any purchase courses with this id ${courses}`,
    });
    return;
  }

  const courseData = await CourseModel.find({
    _id: { $in: courses.map((x) => x.courseId) },
  });
  res.status(200).json({ courses, courseData });
});
courseRouter.get("/preivew", async (req, res) => {
  const courses = await CourseModel.find({});
  if (!courses) {
    res.status(404).json({
      Error: `not found any courses`,
    });
    return;
  }

  res.status(200).json({ Courses: courses });
});

module.exports = {
  courseRouter,
};
