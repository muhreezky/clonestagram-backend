const routes = require("express").Router();
const authMiddleware = require("../middlewares/auth");
const postController = require("../controllers/post");
const upload = require("../uploader");

routes.post("/", authMiddleware.fromToken, upload.single("post_image"), postController.newPost);
routes.get("/", authMiddleware.fromToken, postController.postsList);

routes.put("/:post_id", authMiddleware.fromToken, postController.editPost);
routes.get("/:post_id", authMiddleware.fromToken, postController.viewPost);
routes.delete("/:post_id", authMiddleware.fromToken, postController.deletePost);

routes.put("/:post_id/likes", authMiddleware.fromToken, postController.likeDislike);
routes.get("/:post_id/comments", authMiddleware.fromToken, postController.commentList);
routes.post("/:post_id/comments", authMiddleware.fromToken, postController.sendComment);

module.exports = routes;