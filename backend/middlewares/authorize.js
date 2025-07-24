// middleware/authorize.js
const User = require("../models/User");

exports.authorize = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id).populate("roles");
      if (!user) return res.status(401).json({ message: "User not found" });

      const allPermissions = user.roles.flatMap(role => role.permissions);

      if (!allPermissions.includes(requiredPermission)) {
        return res.status(403).json({ message: "Forbidden: Missing permission" });
      }

      next();
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
};
