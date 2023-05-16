const routes = require("express").Router();
const { body } = require("express-validator");
const { authController } = require("../controllers");
const { authMiddleware } = require("../middlewares");
const upload = require("../uploader");

routes.post(
  "/register", 
  body("email").isEmail(),
  body("username").isAlphanumeric(),
  body("password").isLength({ min: 8 }),
  authController.createAccount
);

routes.post(
  "/login",
  body("password").isLength({ min: 8 }),
  authController.login
);

routes.post("/verify/:verify_token", authMiddleware.fromToken, authController.verifyEmail);

routes.post("/forgot", body("email").isEmail(), authController.sendResetLink);

routes.post("/pass", authMiddleware.fromToken, authController.resetPass);
routes.put("/pass", body("password"), body("new_pass"), authMiddleware.fromToken, authController.changePass);

routes.post("/requestverify", authMiddleware.fromToken, authController.sendVerification);

routes.get("/user", authMiddleware.fromToken, authController.checkUser);
routes.put("/user", authMiddleware.fromToken, upload.single("picture"), authController.editProfile);
module.exports = routes;