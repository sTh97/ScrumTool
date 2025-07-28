const express = require("express");
const router = express.Router();
const lessonsLearnedController = require("../controllers/lessonsLearnedMasterController");

router.get("/", lessonsLearnedController.getAllLessons);
router.post("/", lessonsLearnedController.createLesson);
router.put("/:id", lessonsLearnedController.updateLesson);
router.delete("/:id", lessonsLearnedController.deleteLesson);

module.exports = router;
