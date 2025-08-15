const OtherTaskType = require("../models/OtherTaskType");
const OtherTask = require("../models/OtherTask");
const { isRole } = require("../middlewares/otherTasks.scope");

// controllers/otherTaskTypes.controller.js
exports.createType = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "name is required" });
    }

    const type = await OtherTaskType.create({
      name: name.trim(),
      createdBy: req.user?.id || null, // keeps audit if auth middleware sets req.user
    });

    return res.status(201).json(type);
  } catch (e) {
    // Handle duplicate name nicely
    if (e?.code === 11000) {
      return res.status(409).json({ message: "Task type already exists" });
    }
    return res.status(400).json({ message: e.message });
  }
};


exports.listTypes = async (req, res) => {
  try {
    const { active } = req.query;
    const filter = {};
    if (active === "true") filter.isActive = true;
    if (active === "false") filter.isActive = false;

    const list = await OtherTaskType.find(filter).sort({ name: 1 }).lean();
    res.json(list);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.updateType = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, isActive } = req.body;

    const update = {};
    if (typeof name === "string" && name.trim()) update.name = name.trim();
    if (typeof isActive === "boolean") update.isActive = isActive;
    if (!Object.keys(update).length) {
      return res.status(400).json({ message: "No changes supplied" });
    }

    const out = await OtherTaskType.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });
    if (!out) return res.status(404).json({ message: "Not found" });
    res.json(out);
  } catch (e) {
    if (e?.code === 11000) {
      return res.status(409).json({ message: "Task type already exists" });
    }
    res.status(400).json({ message: e.message });
  }
};

// NEW: delete (safe – blocks if in use)
exports.remove = async (req, res) => {
  try {
    const { id } = req.params;

    // prevent deleting a type that's in use
    const inUse = await OtherTask.countDocuments({ typeId: id });
    if (inUse > 0) {
      return res.status(409).json({
        message: `Cannot delete: type is used by ${inUse} task(s). Deactivate it or reassign tasks first.`,
      });
    }

    const del = await OtherTaskType.findByIdAndDelete(id);
    if (!del) return res.status(404).json({ message: "Not found" });

    res.json({ message: "Deleted" });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};
