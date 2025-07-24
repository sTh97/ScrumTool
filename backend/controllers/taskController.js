const Task = require("../models/Task");
const Sprint = require("../models/Sprint");
const User = require("../models/User");

// CREATE

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

    // const tasks = await Task.find(filter).populate("assignedTo");
    const tasks = await Task.find(filter)
    .populate("assignedTo", "name email")
    .populate("chatHistory.addedBy", "name");
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

exports.updateTask = async (req, res) => {
  try {
    const {
      title,
      description,
      assignedTo,
      estimatedHours,
      status,
      newChatMessage,
      changedBy, // 👈 make sure frontend passes current user ID
    } = req.body;

    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const changes = []; // collect all change log entries

    const prevStatus = task.status;

    // ✅ Status change tracking
    if (status && status !== prevStatus) {
      task.status = status;
      task.statusChangeLog.push({ status, changedAt: new Date() });
      changes.push({
        field: "status",
        oldValue: prevStatus,
        newValue: status,
        changedBy,
        changedAt: new Date(),
      });

      if (status === "In Progress") {
        task.startedAt = task.startedAt || new Date();
        task.activeSessions.push({ from: new Date() });
      }

      if ((prevStatus === "In Progress" && status === "Paused") || status === "Done") {
        const lastSession = task.activeSessions[task.activeSessions.length - 1];
        if (lastSession && !lastSession.to) {
          lastSession.to = new Date();
        }
      }

      if (status === "Done" && task.startedAt && !task.completedAt) {
        task.completedAt = new Date();
        const activeTime = task.activeSessions.reduce((sum, s) => {
          if (s.from && s.to) return sum + (new Date(s.to) - new Date(s.from));
          return sum;
        }, 0);
        task.actualHours = parseFloat((activeTime / (1000 * 60 * 60)).toFixed(2));
      }
    }

    // ✅ Estimated hours validation
    if (estimatedHours !== undefined && Number(estimatedHours) !== task.estimatedHours) {
      const estimatedHoursNum = Number(estimatedHours);
      if (isNaN(estimatedHoursNum)) {
        return res.status(400).json({ message: "Estimated hours must be a valid number." });
      }

      const otherTasks = await Task.find({
        userStoryId: task.userStoryId,
        _id: { $ne: task._id }
      });
      const usedHours = otherTasks.reduce((sum, t) => sum + t.estimatedHours, 0);
      const sprint = await Sprint.findById(task.sprintId);
      const story = sprint.userStories.find(
        s => s.storyId.toString() === task.userStoryId.toString()
      );

      if (usedHours + estimatedHoursNum > story.estimatedHours) {
        return res.status(400).json({ message: "Estimated hours exceed limit." });
      }

      changes.push({
        field: "estimatedHours",
        oldValue: task.estimatedHours,
        newValue: estimatedHoursNum,
        changedBy,
        changedAt: new Date(),
      });

      task.estimatedHours = estimatedHoursNum;
    }

    // ✅ Other basic field updates with logs
    if (title && title !== task.title) {
      changes.push({
        field: "title",
        oldValue: task.title,
        newValue: title,
        changedBy,
        changedAt: new Date(),
      });
      task.title = title;
    }

    if (description && description !== task.description) {
      changes.push({
        field: "description",
        oldValue: task.description,
        newValue: description,
        changedBy,
        changedAt: new Date(),
      });
      task.description = description;
    }

    if (assignedTo && assignedTo !== task.assignedTo?.toString()) {
      changes.push({
        field: "assignedTo",
        oldValue: task.assignedTo,
        newValue: assignedTo,
        changedBy,
        changedAt: new Date(),
      });
      task.assignedTo = assignedTo;
    }

    // ✅ Optional chat message
    if (newChatMessage?.message && newChatMessage?.addedBy) {
      task.chatHistory.push({
        message: newChatMessage.message,
        addedBy: newChatMessage.addedBy,
        timestamp: new Date(),
      });
    }

    // ✅ Save all field changes
    task.changeLog = [...task.changeLog, ...changes];

    await task.save();
    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update task", error: err.message });
  }
};



// exports.updateTask = async (req, res) => {
//   try {
//     const {
//       title,
//       description,
//       assignedTo,
//       estimatedHours,
//       status,
//       newChatMessage,
//       changedBy, // 👈 frontend passes logged-in user's _id
//     } = req.body;

//     const task = await Task.findById(req.params.id);
//     if (!task) return res.status(404).json({ message: "Task not found" });

//     const changes = [];
//     const prevStatus = task.status;

//     // ✅ Track status changes
//     if (status && status !== prevStatus) {
//       task.status = status;
//       task.statusChangeLog.push({ status, changedAt: new Date() });

//       changes.push({
//         field: "status",
//         oldValue: prevStatus,
//         newValue: status,
//         changedBy,
//         changedAt: new Date(),
//       });

//       if (status === "In Progress") {
//         task.startedAt = task.startedAt || new Date();
//         task.activeSessions.push({ from: new Date() });
//       }

//       if ((prevStatus === "In Progress" && status === "Paused") || status === "Done") {
//         const lastSession = task.activeSessions[task.activeSessions.length - 1];
//         if (lastSession && !lastSession.to) {
//           lastSession.to = new Date();
//         }
//       }

//       if (status === "Done" && task.startedAt && !task.completedAt) {
//         task.completedAt = new Date();
//         const activeTime = task.activeSessions.reduce((sum, s) => {
//           if (s.from && s.to) return sum + (new Date(s.to) - new Date(s.from));
//           return sum;
//         }, 0);
//         task.actualHours = parseFloat((activeTime / (1000 * 60 * 60)).toFixed(2));
//       }
//     }

//     // ✅ Estimated hours with validation
//     if (estimatedHours !== undefined && Number(estimatedHours) !== task.estimatedHours) {
//       const estimatedHoursNum = Number(estimatedHours);
//       if (isNaN(estimatedHoursNum)) {
//         return res.status(400).json({ message: "Estimated hours must be a valid number." });
//       }

//       const otherTasks = await Task.find({
//         userStoryId: task.userStoryId,
//         _id: { $ne: task._id },
//       });
//       const usedHours = otherTasks.reduce((sum, t) => sum + t.estimatedHours, 0);
//       const sprint = await Sprint.findById(task.sprintId);
//       const story = sprint.userStories.find(
//         s => s.storyId.toString() === task.userStoryId.toString()
//       );

//       if (usedHours + estimatedHoursNum > story.estimatedHours) {
//         return res.status(400).json({ message: "Estimated hours exceed limit." });
//       }

//       changes.push({
//         field: "estimatedHours",
//         oldValue: task.estimatedHours,
//         newValue: estimatedHoursNum,
//         changedBy,
//         changedAt: new Date(),
//       });

//       task.estimatedHours = estimatedHoursNum;
//     }

//     // ✅ Track title change
//     if (title && title !== task.title) {
//       changes.push({
//         field: "title",
//         oldValue: task.title,
//         newValue: title,
//         changedBy,
//         changedAt: new Date(),
//       });
//       task.title = title;
//     }

//     // ✅ Track description change
//     if (description && description !== task.description) {
//       changes.push({
//         field: "description",
//         oldValue: task.description,
//         newValue: description,
//         changedBy,
//         changedAt: new Date(),
//       });
//       task.description = description;
//     }

//     // ✅ Track assignedTo change
//     if (assignedTo && assignedTo !== task.assignedTo?.toString()) {
//       const oldUser = await User.findById(task.assignedTo);
//       const newUser = await User.findById(assignedTo);

//       changes.push({
//         field: "assignedTo",
//         oldValue: oldUser ? oldUser.name : task.assignedTo,
//         newValue: newUser ? newUser.name : assignedTo,
//         changedBy,
//         changedAt: new Date(),
//       });

//       task.assignedTo = assignedTo;
//     }

//     // ✅ Chat message
//     if (newChatMessage?.message && newChatMessage?.addedBy) {
//       task.chatHistory.push({
//         message: newChatMessage.message,
//         addedBy: newChatMessage.addedBy,
//         timestamp: new Date(),
//       });
//     }

//     // ✅ Append to change log
//     task.taskChangeLog = [...task.taskChangeLog, ...changes];

//     await task.save();

//     res.json(task);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Failed to update task", error: err.message });
//   }
// };














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
