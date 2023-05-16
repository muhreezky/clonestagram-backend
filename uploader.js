const multer = require("multer");
const base = "public/images"

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    switch (file.fieldname) {
      case "picture":
        cb(null, `${base}/avatars`);
        break;
      case "post_image":
        cb(null, `${base}/posts`);
        break;
    }
  },
  filename: function (req, file, cb) {
    const name = file.fieldname === "picture" ? "avatar" : "post";
    cb(null, `${name}-${Date.now()}.${file.mimetype.split("/")[1]}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.split("/")[0] === "image") {
    cb (null, true);
  }
  else {
    cb (new Error("File incompatible"), false);
  }
}

const uploader = multer({ storage, fileFilter });

module.exports = uploader;