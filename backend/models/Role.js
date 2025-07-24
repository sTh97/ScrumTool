const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: String,
  permissions: [String],
  isSystemRole: { type: Boolean, default: false }
});

//Admin user (admin@scrumtool.com / admin123)

module.exports = mongoose.model("Role", roleSchema);