// const mongoose = require("mongoose");

// const documentationVersionSchema = new mongoose.Schema(
//   {
//     documentationId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Documentation",
//       required: true,
//     },
//     versionNumber: {
//       type: Number,
//       required: true,
//     },
//     content: {
//       type: String,
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
//     updatedBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//     },
//      isBaselined: {
//       type: Boolean,
//       default: false,
//     },
//     changeLog: [
//       {
//         field: String, // "title", "content", etc.
//         oldValue: mongoose.Schema.Types.Mixed,
//         newValue: mongoose.Schema.Types.Mixed,
//       },
//     ],
//   },
//   {
//     timestamps: true,
//   }
// );

// module.exports = mongoose.model("DocumentationVersion", documentationVersionSchema);


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

const documentationVersionSchema = new mongoose.Schema(
  {
    documentationId: { type: mongoose.Schema.Types.ObjectId, ref: "Documentation", required: true },
    versionNumber: { type: Number, required: true, index: true },

    // store full snapshot for restore/compare
    title: { type: String, required: true },
    documentType: {
      type: String,
      enum: ["AS-IS","BRD","FSD","HLD","LLD","API","MOM","RELEASE NOTE","OTHER"],
      required: true,
    },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    content: { type: String, required: true },
    attachments: [attachmentSchema],

    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    isBaselined: { type: Boolean, default: false },

    changeLog: [
      {
        field: String,
        oldValue: mongoose.Schema.Types.Mixed,
        newValue: mongoose.Schema.Types.Mixed,
      },
    ],
  },
  { timestamps: true }
);

documentationVersionSchema.index({ documentationId: 1, versionNumber: 1 }, { unique: true });

module.exports = mongoose.model("DocumentationVersion", documentationVersionSchema);
