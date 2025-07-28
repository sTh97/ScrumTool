const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const lessonController = require("../controllers/lessonLearnedController");

// === File Upload Configuration ===
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/lesson-files"); // Make sure this folder exists
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// === Routes ===
router.post("/", upload.array("files", 3), lessonController.createLesson);
router.get("/", lessonController.getAllLessons);
router.get("/:id", lessonController.getLessonById);
router.put("/:id", upload.array("files", 3), lessonController.updateLesson);
router.delete("/:id", lessonController.deleteLesson);
router.get("/download/:filename", lessonController.downloadFile);
router.delete("/file/:filename", lessonController.deleteFile);

module.exports = router;
