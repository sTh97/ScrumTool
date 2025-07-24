// models/Sprint.js
// /

// models/Sprint.js

const mongoose = require("mongoose");

const sprintSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    epic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Epic",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: String,
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    teamMembers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // 👈 Important: this should match your User model name
      },
    ],
    userStories: [
      {
        storyId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "UserStory", // 👈 Reference to the user story
        },
        tshirtSize: {
          type: String,
          enum: ["XS", "S", "M", "L", "XL"],
        },
        estimatedHours: Number,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Sprint", sprintSchema);
