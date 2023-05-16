const { User, Post, Like } = require("../models");

const postController = {
  /**
   * 
   * @param {import("express").Request} req 
   * @param {import("express").Response} res 
   */
  newPost: async (req, res) => {
    try {
      const { user_id, username } = req.user;
      console.log(`File : ${req.file}`);  
      const path = req.file?.path;
      const { caption } = req.body;

      const cleanPath = path && path.replace(/\\/g, "/").replace("public/", "")
      const image_url = path ? `${req.protocol}://${req.headers.host}/${cleanPath}` : "";

      const post = await Post.create({
        user_id,
        caption,
        image_url,
        username
      });

      return res.status(201).json({ message: "Posted successfully", post });
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
  editPost: async (req, res) => {
    try {
      const { post_id } = req.params;
      const { caption } = req.body;

      const post = await Post.findOne({
        where: {
          post_id
        }
      });

      post.caption = caption || post.caption;
      await post.save();

      return res.status(200).json({ message: "Post Edited" });
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
  deletePost: async (req, res) => {
    try {
      const { post_id } = req.params;

      const post = await Post.findOne({
        where: {
          post_id
        }
      });

      await post.destroy();

      return res.status(200).json({ message: "Post Deleted" });
      
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
  viewPost: async (req, res) => {
    try {
      const { post_id } = req.params;

      const post = await Post.findOne({
        where: {
          post_id
        }
      });

      return res.status(200).json(post);
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
  postsList: async (req, res) => {
    try {
      const posts = await Post.findAndCountAll();

      return res.status(200).json(posts);
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
  likeDislike: async (req, res) => {
    try {
      const { user_id } = req.user;
      const { post_id } = req.params;

      const like = await Like.findOne({
        where: {
          user_id,
          post_id
        }
      });

      if (!like) {
        await Like.create({
          user_id,
          post_id
        });
        return res.status(200).json({ message: "Liked a post" });
      } 
      else {
        like.liked = !like.liked;
        return res.status(200).json({ message: `${like.liked ? "Liked" : "Un-liked"} a post` });
      }
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
  commentList: async (req, res) => {
    try {
      const { post_id } = req.params;
      
      const comment = await Comment.findAndCountAll({
        where: {
          post_id
        }
      });

      return res.status(200).json(comment);
    } 
    catch (error) {
      return res.status(500).json(error);
    }
  }
}

module.exports = postController;