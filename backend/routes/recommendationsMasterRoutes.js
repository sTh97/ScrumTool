const express = require("express");
const router = express.Router();
const controller = require("../controllers/recommendationsMasterController");

router.get("/", controller.getAllRecommendations);
router.post("/", controller.createRecommendation);
router.put("/:id", controller.updateRecommendation);
router.delete("/:id", controller.deleteRecommendation);

module.exports = router;
