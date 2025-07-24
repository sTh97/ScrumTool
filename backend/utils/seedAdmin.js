const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Role = require("../models/Role");

async function seedAdmin() {
  try {
    const existingAdminRole = await Role.findOne({ name: "Admin" });
    let adminRole = existingAdminRole;

    if (!existingAdminRole) {
      adminRole = await Role.create({
        name: "Admin",
        description: "System Administrator",
        permissions: ["*"],
        isSystemRole: true
      });
    }

    const existingAdmin = await User.findOne({ email: "admin@scrumtool.com" });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      await User.create({
        name: "Super Admin",
        email: "admin@scrumtool.com",
        password: hashedPassword,
        roles: [adminRole._id]
      });
      console.log("Admin user seeded");
    }
  } catch (err) {
    console.error("Error seeding admin:", err);
  }
}

module.exports = seedAdmin;