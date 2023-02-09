//validate middleware
const validate = require("../middlewares/validate");
const authenticateToken = require("../middlewares/authenticate");
//validations
const schemas = require("../validations/Users");

const express = require("express");
const {
  index,
  create,
  update,
  login,
  projectList,
  resetPassword,
  changePassword,
  updateProfileImage,
  deleteUser,
} = require("../controllers/Users");
const router = express.Router();

router.get("/", index);
router.route("/").post(validate(schemas.createValidation), create);
router.route("/").patch(authenticateToken, validate(schemas.updateValidation), update);
router.route("/login").post(validate(schemas.loginValidation), login);
router.route("/projects").get(authenticateToken, projectList);
router.route("/reset-password").post(validate(schemas.resetPasswordValidation), resetPassword);
router.route("/change-password").post(authenticateToken,validate(schemas.changePasswordValidation), changePassword);
router.route("/update-profile-image").post(authenticateToken, updateProfileImage);
router.route("/:id").delete(authenticateToken, deleteUser);


module.exports = router;
