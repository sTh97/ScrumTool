const Impact = require("../models/Impact");

exports.getAllImpacts = async (req, res) => {
  try {
    const impacts = await Impact.find().sort({ createdAt: -1 });
    res.json(impacts);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch impacts", error: err.message });
  }
};

exports.createImpact = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) {
      return res.status(400).json({ message: "Name is required" });
    }
    const existing = await Impact.findOne({ name: name.trim() });
    if (existing) {
      return res.status(409).json({ message: "Impact with this name already exists" });
    }
    const newImpact = await Impact.create({ name: name.trim() });
    res.status(201).json(newImpact);
  } catch (err) {
    res.status(500).json({ message: "Failed to create impact", error: err.message });
  }
};

exports.updateImpact = async (req, res) => {
  try {
    const { name } = req.body;
    const impact = await Impact.findByIdAndUpdate(req.params.id, { name: name.trim() }, { new: true });
    if (!impact) {
      return res.status(404).json({ message: "Impact not found" });
    }
    res.json(impact);
  } catch (err) {
    res.status(500).json({ message: "Failed to update impact", error: err.message });
  }
};

exports.deleteImpact = async (req, res) => {
  try {
    const deleted = await Impact.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Impact not found" });
    }
    res.json({ message: "Impact deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete impact", error: err.message });
  }
};
