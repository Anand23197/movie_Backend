const express = require("express");
const authController = require("../controller/authController");

const router = express.Router();
router.route("/signup").post(authController.signup);
router.route("/login").post(authController.login);
router.route("/resetPassword").post(authController.resetPassword);
router.route("/forgotPassword").post(authController.forgotPassword);

module.exports = router;
