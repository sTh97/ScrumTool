// routes/userStoryRoutes.js
const express = require("express");
const router = express.Router();
const userStoryController = require("../controllers/userStoryController");
const { authenticate } = require("../middlewares/authMiddleware");

// CRUD for user stories
router.post("/", authenticate, userStoryController.createUserStory);
router.get("/", authenticate, userStoryController.getAllUserStories);
router.get("/:id", authenticate, userStoryController.getUserStoryById);
router.put("/:id", authenticate, userStoryController.updateUserStory);
router.delete("/:id", authenticate, userStoryController.deleteUserStory);

module.exports = router;
