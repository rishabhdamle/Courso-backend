const express = require("express");
const { Router } = require("express");
const { AdminModel, CourseModel } = require("../db");
const adminRouter = Router();
const { z } = require("zod");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { JWT_ADMIN_PASSWORD } = require("../config");
const { adminAuth } = require("../middleware/admin");
adminRouter.use(express.json());

adminRouter.post("/signup", async (req, res) => {
  const { email, password, firstname, lastname } = req.body;

  if (!email || !password || !firstname || !lastname) {
    res.status(404).json({
      Error: `please add all the credentials sir that all are neccsesarry`,
    });
    return;
  }

  const requiredBody = z.object({
    email: z.string().toLowerCase(),
    password: z
      .string()
      .min(8)
      .max(16)
      .regex(/[A-Z]/, "Must contain atleast one upercase later")
      .regex(/[a-z]/, "Must contain atleast one lowercase later")
      .regex(/[#?!@$%^&*-]/, "Must contain atleast one special character"),
    firstname: z.string().min(5).max(100),
    lastname: z.string().min(5).max(100),
  });

  const parsedDataWithSuccsess = requiredBody.safeParse(req.body);

  if (!parsedDataWithSuccsess.success) {
    res.status(404).json({
      Message: `Bad format to enter sir please make sir you are using right format`,
      Error: parsedDataWithSuccsess.error,
    });
  }

  const hasshedPassword = await bcrypt.hash(password, 10);
  try {
    await AdminModel.create({
      email,
      password: hasshedPassword,
      firstname,
      lastname,
    });
  } catch (error) {
    res
      .status(404)
      .json({ Error: `error whlte fetching the data from the databse`, error });
  }

  res.status(200).json({ Message: `You are sign up with succses sir` });
});

adminRouter.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  const admin = await AdminModel.findOne({
    email,
  });

  if (admin) {
    await bcrypt.compare(password, admin.password);

    const token = jwt.sign(
      { adminId: admin._id.toString() },
      JWT_ADMIN_PASSWORD
    );

    res.status(200).json({ Token: token });
  } else {
    res
      .status(404)
      .json({ Error: `you are not signup sir please go and signup first` });
  }
});

adminRouter.post("/createCourse", adminAuth, async (req, res) => {
  const adminId = req.adminId;
  const { title, description, imageUrl, price } = req.body;

  const course = await CourseModel.create({
    title: title,
    description: description,
    price: price,
    imageUrl: imageUrl,
    creatorId: adminId,
  });

  res.status(200).json({
    Message: `course is created succsesfully`,
    courseId: course._id,
  });
});

adminRouter.get("/courses/bulk", adminAuth, async (req, res) => {
  const adminId = req.adminId;

  const courses = await CourseModel.find({
    creatorId: adminId,
  });

  if (!courses) {
    res.status(404).json({
      Error: `not found any purchase courses with this id ${courses.creatorId}`,
    });
    return;
  }

  res.status(200).json({ Courses: courses });
});

adminRouter.put("/updateCourse", adminAuth, async (req, res) => {
  const adminId = req.adminId;

  const { title, description, imageUrl, price, courseId } = req.body;

  if (!title || !description || !imageUrl || !price || !courseId) {
    res.status(404).json({
      Error: `all the fields are neccesarry sir please put all the credentials`,
    });
    return;
  }

  const course = await CourseModel.findOne({
    creatorId: adminId,
    _id: courseId,
  });

  if (!course) {
    res.status(404).json({ Error: `dont find any course` });
    return;
  }

  await CourseModel.updateMany(
    { creatorId: adminId, _id: courseId },
    {
      $set: {
        title: title,
        description: description,
        imageUrl: imageUrl,
        price: price,
      },
    }
  );

  res
    .status(200)
    .json({ Message: `Congo your updation is completd succssfully` });
});

adminRouter.delete("/deleteCourse", adminAuth, async (req, res) => {
  const adminId = req.adminId;
  const courseId = req.headers.id;

  const course = await CourseModel.findOne({
    _id: courseId,
    creatorId: adminId,
  });

  if (!course) {
    res.status(404).json({ Error: `course not found` });
    return;
  }

  await CourseModel.deleteOne({
    _id: courseId,
    creatorId: adminId,
  });

  res.status(200).json({ Message: `Course has been deleted ` });
});
module.exports = {
  adminRouter,
};
