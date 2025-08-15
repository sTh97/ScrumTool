const mongoose = require("mongoose");
const { Schema } = mongoose;

const allowedStatuses = ["To Do", "In Progress", "Paused", "Done"];

const WorkSessionSchema = new Schema({
  from: { type: Date, required: true },
  to: { type: Date }, // null/open when in progress
}, { _id: false });

const StatusLogSchema = new Schema({
  fromStatus: { type: String },
  toStatus: { type: String },
  changedAt: { type: Date, default: Date.now },
  changedBy: { type: Schema.Types.ObjectId, ref: "User" },
}, { _id: false });

const OtherTaskSchema = new Schema({
  project: { type: Schema.Types.ObjectId, ref: "Project", default: null },
  description: { type: String, required: true, trim: true },
  typeId: { type: Schema.Types.ObjectId, ref: "OtherTaskType", required: true },
  createdDate: { type: Date, default: Date.now },
  dueDate: { type: Date },
  durationPlannedHrs: { type: Number, default: 0 },

  status: { type: String, enum: allowedStatuses, default: "To Do" },

  assignee: { type: Schema.Types.ObjectId, ref: "User", required: true },
  assignedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },

  completedAt: { type: Date },
  actualHours: { type: Number, default: 0 },

  workSessions: { type: [WorkSessionSchema], default: [] },
  statusChangeLog: { type: [StatusLogSchema], default: [] },

  notes: { type: String, default: "" },
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

OtherTaskSchema.index({ assignee: 1, status: 1 });
OtherTaskSchema.index({ assignedBy: 1 });
OtherTaskSchema.index({ createdDate: -1 });
OtherTaskSchema.index({ project: 1 });

module.exports = mongoose.model("OtherTask", OtherTaskSchema);
