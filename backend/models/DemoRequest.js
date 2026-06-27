const mongoose = require("mongoose");

const STATUS_OPTIONS = [
  "pending",
  "reviewed",
  "discovery_call_done",
  "deal_closed",
  "deal_rejected",
];

const demoRequestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    company: { type: String, trim: true, default: "" },
    contact: { type: String, trim: true, default: "" },
    message: { type: String, trim: true, default: "" },
    status: {
      type: String,
      enum: STATUS_OPTIONS,
      default: "pending",
    },
    notes: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DemoRequest", demoRequestSchema);
module.exports.STATUS_OPTIONS = STATUS_OPTIONS;
