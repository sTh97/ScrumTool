// File: routes/estimationRoutes.js

const express = require("express");
const router = express.Router();
const estimationController = require("../controllers/estimationController");

router.post("/", estimationController.createEstimation);
router.get("/", estimationController.getAllEstimations);
router.put("/:id", estimationController.updateEstimation);
router.delete("/:id", estimationController.deleteEstimation);

module.exports = router;
