// models/UserStory.js

const mongoose = require("mongoose");

const userStorySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true, // Make sure it's mandatory
  },
  acceptanceCriteria: [String],
  dependencies: [String],
  epic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Epic",
  },
  testCases: {
    positive: [String],
    negative: [String],
  },
});

module.exports = mongoose.model("UserStory", userStorySchema);
