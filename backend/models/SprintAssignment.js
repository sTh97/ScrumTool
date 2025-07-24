const mongoose = require("mongoose");

const sprintAssignmentSchema = new mongoose.Schema({
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
      ref: "User",
    },
  ],
  userStories: [
    {
      storyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserStory",
      },
      tshirtSize: {
        type: String,
        enum: ["XS", "S", "M", "L", "XL"],
      },
      estimatedHours: Number,
    },
  ],
});

module.exports = mongoose.model("SprintAssignment", sprintAssignmentSchema);