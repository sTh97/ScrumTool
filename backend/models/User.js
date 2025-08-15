// const mongoose = require("mongoose");

// const userSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   roles: [{ type: mongoose.Schema.Types.ObjectId, ref: "Role" }],
//   isActive: { type: Boolean, default: true }
// });

// module.exports = mongoose.model("User", userSchema);

// models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  // keep password hidden by default when querying
  password: { type: String, required: true, select: false },
  roles: [{ type: mongoose.Schema.Types.ObjectId, ref: "Role" }],
  isActive: { type: Boolean, default: true },
  passwordChangedAt: { type: Date },
  tokenVersion: { type: Number, default: 0 }, // optional, for JWT invalidation
});

// Hash on create/update if modified
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model("User", userSchema);
