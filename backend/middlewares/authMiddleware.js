// const jwt = require("jsonwebtoken");
// const User = require("../models/User");

// exports.authenticate = async (req, res, next) => {
//   const authHeader = req.headers.authorization;
//   if (!authHeader || !authHeader.startsWith("Bearer ")) {
//     return res.status(401).json({ message: "No token provided" });
//   }

// //  const token = authHeader.split(" ")[1];
// //   try {
// //     const decoded = jwt.verify(token, process.env.JWT_SECRET);
// //     const user = await User.findById(decoded.id).select("_id name");
// //     if (!user) return res.status(404).json({ message: "User not found" });
// //     req.user = user;
// //     next();
// //   } catch (err) {
// //     res.status(401).json({ message: "Invalid token" });
// //   }

//       const token = authHeader.split(" ")[1];
//         try {
//           const decoded = jwt.verify(token, process.env.JWT_SECRET); // { id, tokenVersion? }
//           const user = await User.findById(decoded.id).select("_id name tokenVersion");
//           if (!user) return res.status(404).json({ message: "User not found" });

//           // If you put tokenVersion into the token at login:
//           if (decoded.tokenVersion != null && decoded.tokenVersion !== user.tokenVersion) {
//             return res.status(401).json({ message: "Session expired. Please log in again." });
//           }

//           req.user = user; // has _id and name
//           next();
//         } catch {
//           res.status(401).json({ message: "Invalid token" });
//       }

// };



// middleware/authMiddleware.js

// middleware/authMiddleware.js
// middlewares/authMiddleware.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.authenticate = async (req, res, next) => {
  const h = req.headers.authorization;
  if (!h?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = h.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // { id, tokenVersion }

    const user = await User.findById(decoded.id)
      .select("_id name email isActive tokenVersion") // <-- MUST include tokenVersion
      .populate("roles", "name permissions");

    console.log("TV check:", user.email, "decoded=", decoded.tokenVersion, "db=", user.tokenVersion);  

    if (!user) return res.status(404).json({ message: "User not found" });

    // Safe compare so undefined doesn't break older docs
    if ((decoded.tokenVersion ?? 0) !== (user.tokenVersion ?? 0)) {
      return res.status(401).json({ message: "Session expired. Please log in again." });
    }

    if (user.isActive === false) {
      return res.status(403).json({ message: "Account is deactivated. Contact admin." });
    }

    // Normalize so controllers can use id or _id
    req.user = {
      id: user._id.toString(),
      _id: user._id,
      name: user.name,
      email: user.email,
      roles: user.roles || [],
      tokenVersion: user.tokenVersion ?? 0,
      isActive: user.isActive,
    };

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};



