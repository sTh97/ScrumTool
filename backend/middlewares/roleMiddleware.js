const User = require("../models/User");
const Role = require("../models/Role");

exports.authorizeAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate("roles");
    const isAdmin = user.roles.some(role => role.name === "Admin");
    if (!isAdmin) return res.status(403).json({ message: "Access denied. Admins only." });
    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};