// // routes/dashboardRoutes.js
// const express = require("express");
// const router = express.Router();
// const { getDashboardData, getDashboardStats, getUserStoryInsights, getTaskStats } = require("../controllers/dashboardController");
// const { authenticate } = require("../middlewares/authMiddleware");

// router.get("/", authenticate, getDashboardData);
// router.get("/stats", authenticate, getDashboardStats);
// router.get("/userstory-insights", authenticate, getUserStoryInsights);
// router.get("/task-stats", authenticate, getTaskStats);


// module.exports = router;

// ========================
// routes/dashboardRoutes.js (updated)
// ========================
const express = require("express");
const router = express.Router();
const {
  getDashboardData,
  getDashboardStats,
  getUserStoryInsights,
  getTaskStats,
  getDashboardV2,
  getDashboardMine
} = require("../controllers/dashboardController");
const { authenticate } = require("../middlewares/authMiddleware");

// Legacy v1 endpoints (kept, but now support ?scope=mine)
router.get("/", authenticate, getDashboardData);
router.get("/stats", authenticate, getDashboardStats);
router.get("/userstory-insights", authenticate, getUserStoryInsights); // ?scope=mine
router.get("/task-stats", authenticate, getTaskStats); // ?scope=mine

// New consolidated, role-aware, analytics-heavy endpoint
router.get("/v2", authenticate, getDashboardV2); // ?windowDays=30
router.get("/mine", authenticate, getDashboardMine);

module.exports = router;