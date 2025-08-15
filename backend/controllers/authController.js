const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Role = require("../models/Role");

const signToken = (user) => {
  const payload = { id: user._id.toString(), tokenVersion: user.tokenVersion ?? 0 };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "12h" });
};


const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, roles: user.roles },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

exports.register = async (req, res) => {
  const { name, email, password, roleIds } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "User already exists" });

    const user = await User.create({ name, email, password, roles: roleIds });

    res.status(201).json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// exports.login = async (req, res) => {
//   const { email, password } = req.body;
//   try {
//     // MUST select password + tokenVersion
//     const user = await User.findOne({ email })
//       .select("+password +tokenVersion name email isActive")
//       .populate("roles");

//     if (!user) return res.status(400).json({ message: "Invalid credentials" });
//     if (user.isActive === false) {
//       return res.status(403).json({ message: "Account is deactivated. Contact admin." });
//     }

//     // Check password
//     const ok = await bcrypt.compare(password, user.password);
//     if (!ok) return res.status(400).json({ message: "Invalid credentials" });

//     // DEBUG: prove what we're signing with
//     console.log("[LOGIN] fetched from DB:", {
//       email: user.email,
//       tokenVersion: user.tokenVersion,
//     });
//     console.log("[LOGIN] signing with tokenVersion:", user.tokenVersion);

//     // Sign token with the DB tokenVersion
//     const token = signToken(user);

//     console.log("[LOGIN] token payload should be:", {
//       id: user._id.toString(),
//       tokenVersion: user.tokenVersion ?? 0,
//     });

//     // Return a safe user (no password)
//     const safeUser = {
//       _id: user._id,
//       name: user.name,
//       email: user.email,
//       roles: user.roles,
//       isActive: user.isActive,
//     };

//     return res.json({ token, user: safeUser });
//   } catch (err) {
//     console.error("Login error:", err);
//     return res.status(500).json({ message: "Something went wrong." });
//   }
// };

// exports.login = async (req, res) => {
//   const { email, password } = req.body;
//   try {
//     const user = await User.findOne({ email }).populate("roles");
//     if (!user) return res.status(404).json({ message: "User not found" });

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

//     const token = generateToken(user);
//     res.json({ token, user });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    // Only force-include password (it's select:false). Do NOT whitelist other fields.
    const user = await User.findOne({ email })
      .select("+password")
      .populate("roles");

    if (!user) return res.status(400).json({ message: "Invalid credentials" });
    if (user.isActive === false) {
      return res.status(403).json({ message: "Account is deactivated. Contact admin." });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: "Invalid credentials" });

    // DIAGNOSTICS: prove we’re on the right model & schema
    console.log("[LOGIN] require.resolve(User):", require.resolve("../models/User"));
    console.log("[LOGIN] schema has tokenVersion?", !!User.schema.path("tokenVersion"));

    // If tokenVersion is missing, reload just that field (guard against old model instance)
    let tv = user.tokenVersion;
    if (tv == null) {
      const fresh = await User.findById(user._id).select("tokenVersion");
      tv = fresh?.tokenVersion ?? 0;
      console.warn("[LOGIN] tokenVersion missing on doc; reloaded:", tv);
    }

    console.log("[LOGIN] fetched from DB:", { email: user.email, tokenVersion: tv });

    const token = jwt.sign(
      { id: user._id.toString(), tokenVersion: tv },
      process.env.JWT_SECRET,
      { expiresIn: "12h" }
    );

    console.log("[LOGIN] token payload should be:", { id: user._id.toString(), tokenVersion: tv });

    const safeUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      roles: user.roles,
      isActive: user.isActive,
    };

    return res.json({ token, user: safeUser });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Something went wrong." });
  }
};




exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("roles");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};




