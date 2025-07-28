const PrioritySeverity = require("../models/PrioritySeverity");

exports.getAll = async (req, res) => {
  try {
    const data = await PrioritySeverity.find().sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch records" });
  }
};

exports.create = async (req, res) => {
  try {
    const { name } = req.body;
    const exists = await PrioritySeverity.findOne({ name });
    if (exists) return res.status(400).json({ message: "Already exists" });

    const newEntry = new PrioritySeverity({ name });
    await newEntry.save();
    res.status(201).json(newEntry);
  } catch (err) {
    res.status(500).json({ message: "Failed to create record" });
  }
};

exports.update = async (req, res) => {
  try {
    const { name } = req.body;
    const { id } = req.params;
    await PrioritySeverity.findByIdAndUpdate(id, { name });
    res.json({ message: "Updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to update" });
  }
};

exports.remove = async (req, res) => {
  try {
    await PrioritySeverity.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete" });
  }
};
