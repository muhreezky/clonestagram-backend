const routes = require("express").Router();
const { body } = require("express-validator");
const { authController } = require("../controllers");
const { authMiddleware } = require("../middlewares");

routes.post(
  "/register", 
  body("email").isEmail(),
  body("username").isAlphanumeric(),
  body("password").isLength({ min: 8, max: 20 }),
  authController.createAccount
);

routes.post(
  "/login",
  body("password").isLength({ min: 8, max: 20 }),
  authController.login
);

routes.get("/check-verify", authMiddleware.fromToken, authController.checkVerified);

module.exports = routes;