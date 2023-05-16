const { User } = require("../models");

const { Op } = require("sequelize");
const { validationResult } = require("express-validator");
const crypto = require("crypto");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const transporter = require("../sendemail");
const handlebars = require("handlebars");
const fs = require("fs");
const capitalize = require("../capitalize");

// const loadEnv = require("../env");
// loadEnv();
require("dotenv").config();

const authController = {
  /**
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  sendVerification: async (req, res) => {
    try {
      const { email } = req.user;
      const text = await fs.readFileSync("./template.html", "utf-8");
      const compiled = await handlebars.compile(text);
      const user = await User.findOne({
        where: {
          email,
        },
      });
      user.verify_token = crypto.randomBytes(30).toString("hex");
      await user.save();

      const html = compiled({
        username: user.username,
        verifyLink: `${process.env.FRONTEND}/verify/${user.verify_token}`,
      });

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Verify Account",
        html,
      });

      return res.status(200).json({
        message: "Verification E-mail sent",
        email,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json(error);
    }
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
        verify_token,
      });

      return res.status(201).json({
        message: "Register success",
        user,
      });
    } catch (error) {
      const { message } = error.errors[0];
      return res.status(500).json({ message: capitalize(message) });
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

      if (!isCorrect) {
        return res.status(422).json({
          message: "Please check your username/email or your password",
        });
      }

      const access_token = jwt.sign(
        {
          user_id: user.user_id,
          username: user.username,
          email: user.email,
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
  checkUser: async (req, res) => {
    try {
      const { user_id } = req.user;

      const find = await User.findOne({
        where: {
          user_id,
        },
      });

      // console.log(find);
      return res.status(200).json(find);
    } 
    catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  /**
   *
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   */
  verifyEmail: async (req, res) => {
    try {
      const { verify_token } = req.params;

      const user = await User.findOne({
        where: {
          verify_token,
        },
      });

      if (!user) return res.status(404).json({ message: "User not found" });

      user.verified = true;
      user.verify_token = null;
      await user.save();

      return res.status(200).json({ message: "Verified Successfully" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  /**
   *
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   */
  sendResetLink: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(422).json({ message: "E-mail invalid" });

      const { email } = req.body;

      const user = await User.findOne({
        where: {
          email,
        },
      });

      if (!user) return res.status(404).json({ message: "User not found" });

      user.reset_token = crypto.randomBytes(30).toString("hex");
      user.save();

      const content = await fs.readFileSync('./forgot.html', 'utf-8');
      const compiled = handlebars.compile(content);
      const resetLink = `${process.env.FRONTEND}/reset/${user.reset_token}`;
      const html = compiled({ email, resetLink });

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Forgot Password? No problem!!!',
        html
      });

      return res.status(200).json({ message: "Reset Link Sent" });

    } 
    catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  /**
   * 
   * @param {import("express").Request} req 
   * @param {import("express").Response} res 
   */
  changePass: async (req, res) => {
    try {
      const { user_id } = req.user;
      const { password, new_pass } = req.body;
      
      const user = await User.findOne({
        where: { user_id }
      });

      if (!user) return res.status(404).json({ message: "No user found" });

      const isCorrectPass = await bcrypt.compare(password, user.password);
      if (!isCorrectPass) return res.status(422).json({ message: "Incorrect Password" });

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(new_pass, salt);
      user.save();

      return res.status(200).json({ message: "Password changed successfully" });
    } 
    catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  /**
   * 
   * @param {import("express").Request} req 
   * @param {import("express").Response} res 
   */
  resetPass: async (req, res) => {
    try {
      const { reset_token } = req.params;
      const { password } = req.body;
      
      const user = await User.findOne({
        where: {
          reset_token
        }
      });

      if (!user) return res.status(404).json({ message: "User not found" });

      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(password, salt);

      user.password = hashed;
      await user.save();

      return res.status(200).json({ message: "Password Saved" });
    }
    catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  /**
   * 
   * @param {import("express").Request} req 
   * @param {import("express").Response} res 
   */
  editProfile: async (req, res) => {
    try {
      const { user_id } = req.user;
      const { username, fullname, bio } = req.body;

      const path = req.file?.path;
      // console.log(req.file);
      const cleanPath = path && path.replace(/\\/g, "/").replace("public/", "")
      const imgUrl = path ? `${req.protocol}://${req.headers.host}/${cleanPath}` : "";

      const user = await User.findOne({
        where: {
          user_id
        }
      });
      
      /**@type {string} */
      const deletePath = user.profile_pic.replace(`${req.protocol}://${req.headers.host}/`, "");
      const target = `${__dirname}/../public/${deletePath}`;

      if (path && deletePath.indexOf("default-avatar.png") === -1 && fs.existsSync(target)) {
        fs.unlinkSync(target);
      }

      if (username && (username !== user.username)) {
        user.username = username;
      }
      user.bio =  bio || user.bio;
      user.profile_pic = path ? imgUrl : user.profile_pic;
      user.fullname = fullname || user.fullname;
      await user.save();
      
      // console.log(user);

      return res.status(200).json({
        user,
        message: "Data Edited Successfully"
      })
    } 
    catch (err) {
      // console.log(JSON.parse(JSON.stringify(err)));
      return res.status(500).json({ message: err.message });  
    }
  },

  /**
   * 
   * @param {import("express").Request} req 
   * @param {import("express").Response} res 
   */
  getById: async (req, res) => {
    try {
      const { user_id } = req.params;
      
      const user = await User.findOne({
        where: {
          user_id
        }
      });

      console.log(user);
      return res.status(200).json(user);
    } 
    catch (error) {
      return res.status(500).json(error);
    }
  }
};

module.exports = authController;
