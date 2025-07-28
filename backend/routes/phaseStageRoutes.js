const express = require("express");
const router = express.Router();
const controller = require("../controllers/phaseStageController");

router.get("/", controller.getAllPhases);
router.post("/", controller.createPhase);
router.put("/:id", controller.updatePhase);
router.delete("/:id", controller.deletePhase);

module.exports = router;
