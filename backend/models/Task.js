// const mongoose = require("mongoose");

// const taskSchema = new mongoose.Schema(
//   {
//     title: { type: String, required: true },
//     description: String,
//     assignedTo: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//     },
//     estimatedHours: { type: Number, required: true },
//     actualHours: { type: Number, default: 0 }, // 🆕 Computed field
//     userStoryId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "UserStory",
//       required: true,
//     },
//     sprintId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Sprint",
//       required: true,
//     },
//     status: {
//       type: String,
//       enum: ["To Do", "In Progress", "Blocked", "Done"],
//       default: "To Do",
//     },
//     statusChangeLog: [  // 🆕 For tracking status changes with timestamps
//       {
//         status: String,
//         changedAt: { type: Date, default: Date.now }
//       }
//     ]
//   },
//   {
//     timestamps: true,
//   }
// );

// module.exports = mongoose.model("Task", taskSchema);


const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    estimatedHours: { type: Number, required: true },
    actualHours: { type: Number, default: 0 },

    userStoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserStory",
      required: true,
    },
    sprintId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sprint",
      required: true,
    },
    status: {
      type: String,
      enum: ["To Do", "In Progress", "Blocked", "Done"],
      default: "To Do",
    },

    // ⏱️ Timestamps for automated tracking
    startedAt: Date,
    completedAt: Date,

    // 📜 Optional: log status transitions with timestamp
    statusChangeLog: [
      {
        status: String,
        changedAt: { type: Date, default: Date.now }
      }
    ]
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Task", taskSchema);
