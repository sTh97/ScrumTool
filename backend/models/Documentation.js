// const mongoose = require("mongoose");

// const documentationSchema = new mongoose.Schema(
//   {
//     projectId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Project",
//       required: true,
//     },
//     title: {
//       type: String,
//       required: true,
//     },
//     documentType: {
//       type: String,
//       enum: ["AS-IS", "BRD", "FSD", "HLD", "LLD", "API", "MOM", "RELEASE NOTE", "OTHER"],
//       required: true,
//     },
//     content: {
//       type: String, // HTML or JSON string from rich text editor
//       required: true,
//     },
//     attachments: [
//       {
//         filename: String,
//         originalName: String,
//         size: Number,
//         mimeType: String,
//         filePath: String,
//       },
//     ],
//     currentVersion: {
//       type: Number,
//       default: 1,
//     },
//     createdBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//     },
//     updatedBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// module.exports = mongoose.model("Documentation", documentationSchema);


const mongoose = require("mongoose");

const attachmentSchema = new mongoose.Schema(
  {
    filename: String,
    originalName: String,
    size: Number,
    mimeType: String,
    filePath: String,
  },
  { _id: true }
);

const documentationSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    title: { type: String, required: true },
    documentType: {
      type: String,
      enum: ["AS-IS","BRD","FSD","HLD","LLD","API","MOM","RELEASE NOTE","OTHER"],
      required: true,
    },

    // Snapshot of the ACTIVE version (for quick loads)
    content: { type: String, required: true },
    attachments: [attachmentSchema],

    currentVersion: { type: Number, default: 1 },

    // NEW: the currently active version
    activeVersion: { type: mongoose.Schema.Types.ObjectId, ref: "DocumentationVersion" },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Documentation", documentationSchema);

