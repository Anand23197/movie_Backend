const User = require("./../models/userModel");
const asyncErrorHandler = require("../utils/asyncErrorHandler");
const jwt = require("jsonwebtoken");
const CustomError = require("../utils/customError");
const util = require("util");
const sendEmail = require("../utils/email");
const crypto = require("crypto");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.SECRET_STR, {
    expiresIn: process.env.LOGIN_EXPIRES,
  });
};

const createSendRes = (user, statusCode, res) => {
  const token = signToken(user._id);

  const options = {
    maxAge: process.env.LOGIN_EXPIRES,
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }
  res.cookie("jwt", token, options);

  user.password = undefined;
  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.signup = asyncErrorHandler(async (req, res, next) => {
  const newUser = await User.create(req.body);
  createSendRes(newUser, 201, res);
});

exports.login = asyncErrorHandler(async (req, res, next) => {
  // const email = req.body.email;
  // const password = req.body.password;

  const { email, password } = req.body;
  if (!email || !password) {
    const error = new CustomError(
      "Please provide email and password for login in."
    );
    return next(error);
  }

  //check if the user exist in database
  const user = await User.findOne({ email }).select("password");

  //   const isMatch = await user.comparePasswordInDb(password, user.password);

  if (!user || !(await user.comparePasswordInDb(password, user.password))) {
    const error = new CustomError("Incorrect user or password", 400);
    return next(error);
  }

  createSendRes(user, 200, res);
});

exports.protect = asyncErrorHandler(async (req, res, next) => {
  //1. read the token & check if it exist
  const testToken = req.headers.authorization;
  let token;
  if (testToken && testToken.startsWith("Bearer")) {
    token = testToken.split(" ")[1];
  }
  if (!token) {
    next(new CustomError("you are not logged in.!", 401));
  }
  //2. validate the token
  const decodedToken = await util.promisify(jwt.verify)(
    token,
    process.env.SECRET_STR
  );
  //3. if the user exists in the db
  const user = await User.findById(decodedToken.id);

  if (!user) {
    const error = new CustomError(
      "The user with given token does not exist",
      401
    );
    next(error);
  }
  //4. if the user changed password after the token was issued
  const isPasswordChanged = await user.isPasswordChanged(decodedToken.iat);
  if (isPasswordChanged) {
    const error = new CustomError(
      "password have been changed recently please login agin",
      401
    );
    return next(error);
  }

  //5. Allow user to access route
  req.user = user;
  next();
});

exports.restrict = (role) => {
  return (req, res, next) => {
    if (req.user.role !== role) {
      const error = new CustomError(
        "You don't have permission to perform the action",
        403
      );
      next(error);
    }
    next();
  };
};

//if you have multiple role to restrict than use this function otherwise use above function
// exports.restrict = (...role) => {
//   return (req, res, next) => {
//     if (!role.includes(req.role)) {
//       const error = new CustomError(
//         "You don't have permission to perform the action",
//         403
//       );
//       next(error);
//     }
//     next();
//   };
// };

exports.forgotPassword = asyncErrorHandler(async (req, res, next) => {
  //get user based on posted email
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    const error = new CustomError(
      "We could not find the email with given email",
      404
    );
    next(error);
  }

  //generate a random reset token

  const resetToken = await user.createResetPasswordToken();
  await user.save({ validateBeforeSave: false });
  //send the token back to the user email
  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetPassword/${resetToken}`;
  const message = `we have received a password reset request. Please use the below link to reset your password\n\n ${resetUrl}\n\n This reset password link is valid only for 10 minutes`;
  try {
    await sendEmail({
      email: user.email,
      subject: "password change request received",
      message: message,
    });

    res.status(200).json({
      status: "success",
      message: "password reset link send to the user email",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    user.save({ validateBeforeSave: false });

    return next(
      new CustomError(
        `There was an error sending password reset email. Please try again later`,
        500
      )
    );
  }
});

exports.resetPassword = async (req, res, next) => {
  //if the user exist with given token & token has not expired
  const token = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetTokenExpires: { $gt: Date.now() },
  });

  if (!user) {
    const error = new CustomError("Token is invalid or has expired!", 400);
    next(error);
  }

  //resetting the user password
  user.password = req.body.password;
  req.confirmPassword = req.body.confirmPassword;

  user.passwordResetToken = undefined;
  user.passwordResetTokenExpires = undefined;
  user.passwordChangedAt = Date.now();
  user.save();

  //login the user ones the password is changed
  createSendRes(user, 200, res);
};
