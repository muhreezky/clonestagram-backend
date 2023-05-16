require("dotenv").config();
const jwt = require("jsonwebtoken");

const authMiddleware = {
  /**
   * 
   * @param {import("express").Request} req 
   * @param {import("express").Response} res 
   */
  fromToken: async (req, res, next) => {
    try {
      const { authorization } = req.headers;
      const access_token = authorization?.split(" ")[1];
      const account = await jwt.verify(access_token, process.env.JWT_SECRET);
  
      if (!account) return res.status(401).json({ message: "Unauthorized" });

      req.user = account;

      next();
    } 
    catch (error) {
      console.log(error);
      return res.status(500).json({ message: error.message });
    }
  },
}

module.exports = authMiddleware;