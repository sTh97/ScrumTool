const Role = require("../models/Role");

exports.createRole = async (req, res) => {
  try {
    const { name, description, permissions } = req.body;
    const existing = await Role.findOne({ name });
    if (existing) return res.status(400).json({ message: "Role already exists" });

    const role = await Role.create({ name, description, permissions });
    res.status(201).json(role);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllRoles = async (req, res) => {
  try {
    const roles = await Role.find();
    res.json(roles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateRole = async (req, res) => {
  try {
    const role = await Role.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(role);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteRole = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (role.isSystemRole) return res.status(403).json({ message: "Cannot delete system role" });
    await role.deleteOne();
    res.json({ message: "Role deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};