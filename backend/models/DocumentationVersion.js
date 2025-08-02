const mongoose = require("mongoose");

const documentationVersionSchema = new mongoose.Schema(
  {
    documentationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Documentation",
      required: true,
    },
    versionNumber: {
      type: Number,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    attachments: [
      {
        filename: String,
        originalName: String,
        size: Number,
        mimeType: String,
        filePath: String,
      },
    ],
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
     isBaselined: {
      type: Boolean,
      default: false,
    },
    changeLog: [
      {
        field: String, // "title", "content", etc.
        oldValue: mongoose.Schema.Types.Mixed,
        newValue: mongoose.Schema.Types.Mixed,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("DocumentationVersion", documentationVersionSchema);
