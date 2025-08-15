const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Role = require("../models/Role");

const isAdminByRoles = (roles = []) =>
  roles.some(r => {
    const n = (r.name || "").toLowerCase();
    return n === "admin" || n === "system administrator";
  });

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, roles } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "User already exists" });

    const user = await User.create({ name, email, password, roles });
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().populate("roles");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deactivateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    res.json({ message: "User deactivated", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.reactivateUser = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);
  if (!user) return res.status(404).json({ message: "User not found" });

  user.isActive = true;
  await user.save();

  res.status(200).json({ message: "User reactivated successfully" });
};

exports.changeMyPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body || {};
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required." });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "New password and confirmation do not match." });
    }

    // Basic policy — adjust as needed
    const policy = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!policy.test(newPassword)) {
      return res.status(400).json({
        message: "Password must be 8+ chars with upper, lower, number, and symbol.",
      });
    }

    // Load full user with roles + password
    const me = await User.findById(req.user._id)
      .populate("roles", "name")
      .select("+password");
    if (!me) return res.status(404).json({ message: "User not found." });

    // Block admins from this self-service flow (per your requirement)
    if (isAdminByRoles(me.roles)) {
      return res.status(403).json({ message: "Admins cannot change password via self-service." });
    }

    const ok = await me.comparePassword(currentPassword);
    if (!ok) return res.status(400).json({ message: "Current password is incorrect." });

    const same = await me.comparePassword(newPassword);
    if (same) return res.status(400).json({ message: "New password cannot be the same as the old password." });

    me.password = newPassword;             // will hash via pre-save hook
    me.passwordChangedAt = new Date();
    me.tokenVersion = (me.tokenVersion || 0) + 1; // optional, for JWT invalidation
    await me.save();

    return res.json({ message: "Password updated successfully. Please sign in again." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Something went wrong." });
  }
};


