const User = require("./../models/userModel");
const asyncErrorHandler = require("../utils/asyncErrorHandler");
const CustomError = require("../utils/customError");
const authController = require("./authController");
const jwt = require("jsonwebtoken");

exports.getAllUsers = asyncErrorHandler(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    status: "success",
    result: users.length,
    data: {
      users,
    },
  });
});

const signToken = (id) => {
  return jwt.sign({ id }, process.env.SECRET_STR, {
    expiresIn: process.env.LOGIN_EXPIRES,
  });
};
const createSendRes = (user, statusCode, res) => {
  const token = signToken(user._id);

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

const filterReqObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((prop) => {
    if (allowedFields.includes(prop)) newObj[prop] = obj[prop];
  });

  return newObj;
};

exports.updatePassword = asyncErrorHandler(async (req, res, next) => {
  //GET CURRENT USER DATA FROM DATABASE
  const user = await User.findById(req.user._id).select("+password");
  //CHECK IF THE SUPPLIED CURRENT PASSWORD IS CORRECT.
  if (
    !(await user.comparePasswordInDb(req.body.currentPassword, user.password))
  ) {
    return next(
      new CustomError("The current password you provided is wrong", 401)
    );
  }
  //IF SUPPLIED PASSWORD IS CORRECT, UPDATE USER PASSWORD WITH NEW VALUE
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  await user.save();

  //LOGIN USER AND SEND JWT
  createSendRes(user, 200, res);
});

exports.updateMe = asyncErrorHandler(async (req, res, next) => {
  //CHECK IF REQUEST DATA CONTAIN PASSWORD | CONFIRM PASSWORD
  if (req.body.password || req.body.confirmPassword) {
    return next(
      new CustomError(
        "You cannot update your password using this end point",
        400
      )
    );
  }

  //UPDATE USER DETAIL
  const filterObj = filterReqObj(req.body, "name", "email");
  const user = await User.findByIdAndUpdate(req.user.id, filterObj, {
    runValidators: true,
    new: true,
  });

  res.status(200).json({
    status: "success",
    data: user,
  });
});

exports.deleteMe = asyncErrorHandler(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: "success",
    data: null,
  });
});
