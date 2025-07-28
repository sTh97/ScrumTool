const express = require("express");
const router = express.Router();
const frequencyController = require("../controllers/frequencyController");

router.get("/", frequencyController.getAllFrequencies);
router.post("/", frequencyController.createFrequency);
router.put("/:id", frequencyController.updateFrequency);
router.delete("/:id", frequencyController.deleteFrequency);

module.exports = router;
