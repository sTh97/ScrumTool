const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");
const { authenticate } = require("../middlewares/authMiddleware");

router.use(authenticate);

// CREATE
router.post("/", taskController.createTask);

// READ
router.get("/", taskController.getAllTasks); // Optional query: ?sprintId=...&userStoryId=...
router.get("/:id", taskController.getTaskById);

// UPDATE
router.put("/:id", taskController.updateTask);

// DELETE
router.delete("/:id", taskController.deleteTask);

module.exports = router;
