// File: models/Estimation.js

const mongoose = require("mongoose");

const estimationSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    hours: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Estimation", estimationSchema);
