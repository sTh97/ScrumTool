// models/PrioritySeverity.js
const mongoose = require("mongoose");

const prioritySeveritySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PrioritySeverity", prioritySeveritySchema);
