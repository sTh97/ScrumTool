// // ✅ Full updated version with chat history support added to task model, controller, and UI

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
//     actualHours: { type: Number, default: 0 },

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
//       enum: ["To Do", "In Progress", "Paused", "Done"],
//       default: "To Do",
//     },

//     // Timestamps for time tracking
//     startedAt: Date,
//     completedAt: Date,

//     // Track status transitions with timestamp
//     statusChangeLog: [
//       {
//         status: {
//           type: String,
//           enum: ["To Do", "In Progress", "Paused", "Done"],
//         },
//         changedAt: { type: Date, default: Date.now },
//       },
//     ],

//     // Tracks active work sessions (In Progress to Paused/Done)
//     activeSessions: [
//       {
//         from: Date,
//         to: Date,
//       },
//     ],

//     // 💬 Chat history
//     chatHistory: [
//       {
//         message: { type: String },
//         addedBy: {
//           type: mongoose.Schema.Types.ObjectId,
//           ref: "User",
//         },
//         timestamp: { type: Date, default: Date.now },
//       },
//     ],
//   },
//   { timestamps: true },
  
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
      enum: ["To Do", "In Progress", "Paused", "Done"],
      default: "To Do",
    },

    startedAt: Date,
    completedAt: Date,

    // ✅ Status change log
    statusChangeLog: [
      {
        status: {
          type: String,
          enum: ["To Do", "In Progress", "Paused", "Done"],
        },
        changedAt: { type: Date, default: Date.now },
      },
    ],

    // ✅ Work sessions
    activeSessions: [
      {
        from: Date,
        to: Date,
      },
    ],

    // ✅ Chat history
    chatHistory: [
      {
        message: { type: String },
        addedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        timestamp: { type: Date, default: Date.now },
      },
    ],

    // ✅ New: General task change log (title, description, etc.)
    taskChangeLog: [
      {
        field: { type: String },
        from: mongoose.Schema.Types.Mixed,
        to: mongoose.Schema.Types.Mixed,
        changedAt: { type: Date, default: Date.now },
        changedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],
    changeLog: [
      {
        field: String,             // e.g. "title", "estimatedHours"
        oldValue: mongoose.Schema.Types.Mixed,
        newValue: mongoose.Schema.Types.Mixed,
        changedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        },
        changedAt: { type: Date, default: Date.now }
      }
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);
