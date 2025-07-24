//For rights issues

// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const permissionMap = require("../config/permissionMap");

exports.authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    const user = await User.findById(decoded.id).populate("roles");
    if (!user) return res.status(401).json({ message: "User not found" });

    const allPermissions = user.roles.flatMap(role => role.permissions);
    req.permissions = allPermissions;

    const method = req.method;
    // 🔥 Use baseUrl + route.path
    // let rawPath = `${req.baseUrl}${req.route?.path || ""}`;
    // Construct full path like "/api/users"
    let rawPath = `${req.baseUrl}${req.route?.path || ""}`;
    // Remove trailing slashes and normalize dynamic segments
    let path = rawPath.replace(/\/[a-f0-9]{24}/g, "/:id").replace(/\/+$/, "");
    // const path = rawPath.replace(/\/[a-f0-9]{24}/g, "/:id");
    console.log(rawPath, "And", path)
    console.log("Checking permission for", method, path);

    const requiredPermission = permissionMap[method]?.[path];
    
    // if (requiredPermission && !allPermissions.includes(requiredPermission)) {
    //   return res.status(403).json({ message: `Forbidden: Missing ${requiredPermission}` });
    // }

    if (requiredPermission && !req.permissions.includes(requiredPermission)) {
      return res.status(403).json({ message: `Forbidden: Missing ${requiredPermission}` });
    }

    if (!requiredPermission) {
      console.warn(`[WARN] No permission mapping found for: ${method} ${path}`);
    }

    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};