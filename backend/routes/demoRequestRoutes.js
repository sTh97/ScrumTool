const express = require("express");
const router = express.Router();
const { authenticate } = require("../middlewares/authMiddleware");
const { authorizeAdmin } = require("../middlewares/roleMiddleware");
const {
  createDemoRequest,
  getAllDemoRequests,
  getDemoRequestById,
  updateDemoRequest,
  getDashboardStats,
} = require("../controllers/demoRequestController");

router.post("/", createDemoRequest);

router.get("/stats/dashboard", authenticate, authorizeAdmin, getDashboardStats);
router.get("/", authenticate, authorizeAdmin, getAllDemoRequests);
router.get("/:id", authenticate, authorizeAdmin, getDemoRequestById);
router.patch("/:id", authenticate, authorizeAdmin, updateDemoRequest);

module.exports = router;
