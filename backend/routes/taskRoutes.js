const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");
const { authenticate } = require("../middlewares/authMiddleware");

router.use(authenticate);

// CREATE
router.post("/", authenticate, taskController.createTask);

// READ
router.get("/", authenticate, taskController.getAllTasks); // Optional query: ?sprintId=...&userStoryId=...
router.get("/:id", authenticate, taskController.getTaskById);

// UPDATE
router.put("/:id", authenticate, taskController.updateTask);

// DELETE
router.delete("/:id", authenticate, taskController.deleteTask);

module.exports = router;
