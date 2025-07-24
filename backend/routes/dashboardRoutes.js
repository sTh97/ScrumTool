// routes/dashboardRoutes.js
const express = require("express");
const router = express.Router();
const { getDashboardData, getDashboardStats, getUserStoryInsights, getTaskStats } = require("../controllers/dashboardController");
const { authenticate } = require("../middlewares/authMiddleware");

router.get("/", authenticate, getDashboardData);
router.get("/stats", authenticate, getDashboardStats);
router.get("/userstory-insights", authenticate, getUserStoryInsights);
router.get("/task-stats", authenticate, getTaskStats);


module.exports = router;
