const { User } = require("../models");

const { Op } = require("sequelize");
const { validationResult } = require("express-validator");
const crypto = require("crypto");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

const loadEnv = require("../env");
loadEnv();

const authController = {
  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  sendVerification: async (req, res) => {
    try {
    } catch (error) {}
  },

  /**
   *
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   */
  createAccount: async (req, res) => {
    try {
      const errors = validationResult(req).array();
      const { email, username, password, fullname, bio } = req.body;

      if (errors.length > 0) {
        return res.status(422).json({
          message: "Invalid Input",
          errors,
        });
      }

      const salt = await bcrypt.genSalt(10);
      const hashPass = await bcrypt.hash(password, salt);
      const verify_token = crypto.randomBytes(30).toString("hex");

      /**
       * @type {import("sequelize").Model} user
       */
      const user = await User.create({
        email,
        fullname,
        bio,
        username,
        password: hashPass,
        verify_token
      });

      return res.status(201).json({
        message: "Register success",
        user,
      });
    } 
    catch (error) {
      return res.status(500).json({ error: error.errors[0] });
    }
  },

  /**
   *
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   */
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const emailRegex = /[A-Z0-9._%+-]+@[A-Z0-9-]+.[a-z.]{2,4}/gim;
      let loginWith = "email";
      if (!emailRegex.test(email)) {
        loginWith = "username";
      }

      const user = await User.findOne({
        where: {
          [loginWith]: email,
        },
      });

      if (!user) return res.status(404).json({ message: "User not found" });

      const isCorrect = await bcrypt.compare(password, user.password);

      if (!isCorrect) return res.status(422).json({ message: "Invalid Login" });

      const access_token = jwt.sign(
        { 
          user_id: user.user_id,
          username: user.username,
          email: user.email
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      return res.status(200).json({
        message: `Welcome, @${user.username}`,
        access_token,
      });
    } catch (error) {
      return res.status(500).json(error);
    }
  },
  
  /**
   * 
   * @param {import("express").Request} req 
   * @param {import("express").Response} res 
   */
  checkVerified: async (req, res) => {
    try {
      const { user_id } = req.user;
  
      const find = User.findOne({
        where: {
          user_id
        }
      });
  
      return res.status(200).json({ username: find.username, email: find.email, verified: find.verified });
    } 
    catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
};

module.exports = authController;
