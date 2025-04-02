const express = require("express");
const { Router } = require("express");
const { UserModel, PurchaseModel, CourseModel } = require("../db");
const { courseRouter } = require("./course");
const { z } = require("zod");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { JWT_USER_PASSWORD } = require("../config");
const { userAuth } = require("../middleware/user");
const userRouter = Router();

userRouter.use(express.json());

userRouter.post("/signup", async (req, res) => {
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
    await UserModel.create({
      email,
      password: hasshedPassword,
      firstname,
      lastname,
    });
  } catch (error) {
    res.status(404).json({
      Error: `error while fecthing the data from the  database`,
      error,
    });
  }

  res.status(200).json({ Message: `You are sign up with succses sir` });
});
userRouter.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  const user = await UserModel.findOne({
    email,
  });

  if (!user) {
    res
      .status(404)
      .json({ Error: `you are not signup sir please go and signup first` });
    return;
  }
  const passwordmatch = await bcrypt.compare(password, user.password);

  if (!passwordmatch) {
    res.status(404).json({ Error: `you have a wrong password sir` });
    return;
  }

  const token = jwt.sign({ userId: user._id.toString() }, JWT_USER_PASSWORD);

  res.status(200).json({ Token: token });
});
userRouter.post("/purchase", userAuth, async (req, res) => {
  const courseId = req.body.id;
  const userId = req.userId;

  const course = await CourseModel.findOne({
    _id: courseId,
  });

  if (!course) {
    res.status(404).json({ Error: `course not found` });
    return;
  }

  const purchase = await PurchaseModel.create({
    courseId: course._id,
    userId,
  });

  res.status(200).json({
    Message: `Purchase succssfull `,
    purchaseId: purchase._id,
  });
});

module.exports = {
  userRouter,
};
