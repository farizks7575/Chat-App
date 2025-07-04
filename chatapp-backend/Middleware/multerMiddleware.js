// multerMiddleware.js

const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "./uploads"),
  filename: (req, file, cb) => {
    const filename = `file-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, filename);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/png",
    "image/jpg",
    "image/jpeg",
    "image/webp",
    "video/mp4",
    "video/avi",
    "video/mkv",
    "video/mov",
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only images (.png, .jpg, .jpeg, .webp) and videos (.mp4, .avi, .mkv, .mov) are allowed!"
      ),
      false
    );
  }
};

const upload = multer({ storage, fileFilter }); // Rename to upload

module.exports = upload; // Export it as 'upload'
