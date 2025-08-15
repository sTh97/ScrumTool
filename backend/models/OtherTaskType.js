const mongoose = require("mongoose");
const { Schema } = mongoose;

const OtherTaskTypeSchema = new Schema({
  name: { type: String, required: true, trim: true, unique: true },
  isActive: { type: Boolean, default: true },
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

OtherTaskTypeSchema.index({ name: 1 }, { unique: true });

module.exports = mongoose.model("OtherTaskType", OtherTaskTypeSchema);
