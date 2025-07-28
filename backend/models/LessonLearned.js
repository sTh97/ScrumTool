const mongoose = require("mongoose");

const lessonLearnedSchema = new mongoose.Schema(
  {
    sprintId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sprint",
      required: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    epicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Epic",
      required: true,
    },
    createdDate: {
      type: Date,
      required: true,
      default: Date.now,
      immutable: true,
    },
    loggedDate: {
      type: Date,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    contributors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    phaseStageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PhaseStage",
    },
    description: String,
    rootCause: String,
    impactId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Impact",
    },
    actionsTaken: String,
    lessonsLearnedId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LessonsLearnedMaster",
    },
    recommendationsId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RecommendationsMaster",
    },
    prioritySeverityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PrioritySeverity",
    },
    frequencyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Frequency",
    },
    files: [
      {
        filename: String,
        originalname: String,
        mimetype: String,
        size: Number,
        path: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("LessonLearned", lessonLearnedSchema);
