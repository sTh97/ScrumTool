const Task = require("../models/Task");
const Sprint = require("../models/Sprint");

// CREATE
// exports.createTask = async (req, res) => {
//   try {
//     const { title, description, assignedTo, estimatedHours, userStoryId, sprintId, status } = req.body;

//     const sprint = await Sprint.findById(sprintId);
//     const story = sprint.userStories.find(story => story.storyId.toString() === userStoryId);
//     console.log("Matched Story:", story);
//     if (!story) {
//       return res.status(404).json({ message: "User Story not found in Sprint" });
//     }

//     const existingTasks = await Task.find({ userStoryId });
//     const totalTaskHours = existingTasks.reduce((sum, t) => sum + t.estimatedHours, 0);

//     if (totalTaskHours + estimatedHours > story.estimatedHours) {
//       return res.status(400).json({
//         message: "Total task hours exceed user story estimated hours. Adjust task or re-estimate story."
//       });
//     }

//     const task = new Task({ title, description, assignedTo, estimatedHours, userStoryId, sprintId, status });
//     await task.save();

//     res.status(201).json(task);
//   } catch (err) {
//     res.status(500).json({ message: "Failed to create task", error: err.message });
//   }
//   console.log("Create Task Payload:", req.body);
// };

exports.createTask = async (req, res) => {
  try {
    const { title, description, assignedTo, estimatedHours, userStoryId, sprintId, status } = req.body;

    const numericEstimated = Number(estimatedHours);
    if (isNaN(numericEstimated) || numericEstimated <= 0) {
      return res.status(400).json({ message: "Invalid estimated hours" });
    }

    const sprint = await Sprint.findById(sprintId);
    if (!sprint) {
      return res.status(404).json({ message: "Sprint not found" });
    }

    const story = sprint.userStories.find(story => story.storyId.toString() === userStoryId);
    console.log("Matched Story:", story);

    if (!story) {
      return res.status(404).json({ message: "User Story not found in Sprint" });
    }

    const existingTasks = await Task.find({ userStoryId });
    const totalTaskHours = existingTasks.reduce((sum, t) => sum + t.estimatedHours, 0);

    console.log("Total existing task hours:", totalTaskHours);
    console.log("Incoming estimated hours:", numericEstimated);
    console.log("Story allowed estimated hours:", story.estimatedHours);

    if (totalTaskHours + numericEstimated > story.estimatedHours) {
      return res.status(400).json({
        message: "Total task hours exceed user story estimated hours. Adjust task or re-estimate story."
      });
    }

    const task = new Task({
      title,
      description,
      assignedTo,
      estimatedHours: numericEstimated,
      userStoryId,
      sprintId,
      status
    });

    await task.save();

    console.log("Create Task Payload:", req.body);
    res.status(201).json(task);

  } catch (err) {
    console.error("Error creating task:", err);
    res.status(500).json({ message: "Failed to create task", error: err.message });
  }
};


// READ ALL (Optional filter: sprintId, userStoryId)
exports.getAllTasks = async (req, res) => {
  try {
    const { sprintId, userStoryId } = req.query;
    const filter = {};
    if (sprintId) filter.sprintId = sprintId;
    if (userStoryId) filter.userStoryId = userStoryId;

    const tasks = await Task.find(filter).populate("assignedTo");
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch tasks", error: err.message });
  }
};

// READ BY ID
exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate("assignedTo");
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch task", error: err.message });
  }
};

// UPDATE

// exports.updateTask = async (req, res) => {
//   try {
//     const { title, description, assignedTo, estimatedHours, status } = req.body;
//     const task = await Task.findById(req.params.id);
//     if (!task) return res.status(404).json({ message: "Task not found" });

//     // Track status change for actualHours
//     const prevStatus = task.status;
//     if (status && status !== prevStatus) {
//       if (status === "In Progress" && !task.startedAt) {
//         task.startedAt = new Date();
//       }
//       if (status === "Done" && !task.completedAt) {
//         task.completedAt = new Date();

//         if (task.startedAt) {
//           const durationMs = task.completedAt - task.startedAt;
//           const hours = durationMs / (1000 * 60 * 60);
//           task.actualHours = parseFloat(hours.toFixed(2)); // rounded to 2 decimals
//         }
//       }
//     }

//     // Optional: estimated hours validation
//     if (estimatedHours !== undefined && estimatedHours !== task.estimatedHours) {
//       const otherTasks = await Task.find({ userStoryId: task.userStoryId, _id: { $ne: task._id } });
//       const usedHours = otherTasks.reduce((sum, t) => sum + t.estimatedHours, 0);
//       const sprint = await Sprint.findById(task.sprintId);
//       const story = sprint.userStories.find(s => s.storyId.toString() === task.userStoryId.toString());

//       if (usedHours + estimatedHours > story.estimatedHours) {
//         return res.status(400).json({ message: "Estimated hours exceed limit." });
//       }

//       task.estimatedHours = estimatedHours;
//     }

//     task.title = title ?? task.title;
//     task.description = description ?? task.description;
//     task.assignedTo = assignedTo ?? task.assignedTo;
//     task.status = status ?? task.status;

//     await task.save();
//     res.json(task);
//   } catch (err) {
//     res.status(500).json({ message: "Failed to update task", error: err.message });
//   }
// };

exports.updateTask = async (req, res) => {
  try {
    const { title, description, assignedTo, estimatedHours, status } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    // Track status change for actualHours
    const prevStatus = task.status;
    if (status && status !== prevStatus) {
      if (status === "In Progress" && !task.startedAt) {
        task.startedAt = new Date();
      }
      if (status === "Done" && !task.completedAt) {
        task.completedAt = new Date();

        if (task.startedAt) {
          const durationMs = task.completedAt - task.startedAt;
          const hours = durationMs / (1000 * 60 * 60);
          task.actualHours = parseFloat(hours.toFixed(2)); // rounded to 2 decimals
        }
      }
    }

    // Optional: estimated hours validation
    if (estimatedHours !== undefined && Number(estimatedHours) !== task.estimatedHours) {
      const estimatedHoursNum = Number(estimatedHours);
      if (isNaN(estimatedHoursNum)) {
        return res.status(400).json({ message: "Estimated hours must be a valid number." });
      }

      const otherTasks = await Task.find({ userStoryId: task.userStoryId, _id: { $ne: task._id } });
      const usedHours = otherTasks.reduce((sum, t) => sum + t.estimatedHours, 0);
      const sprint = await Sprint.findById(task.sprintId);
      const story = sprint.userStories.find(s => s.storyId.toString() === task.userStoryId.toString());

      if (usedHours + estimatedHoursNum > story.estimatedHours) {
        return res.status(400).json({ message: "Estimated hours exceed limit." });
      }

      task.estimatedHours = estimatedHoursNum;
    }

    // Apply remaining updates
    task.title = title ?? task.title;
    task.description = description ?? task.description;
    task.assignedTo = assignedTo ?? task.assignedTo;
    task.status = status ?? task.status;

    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: "Failed to update task", error: err.message });
  }
};




// DELETE
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete task", error: err.message });
  }
};
