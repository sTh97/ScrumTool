const Epic = require("../models/Epic");

exports.createEpic = async (req, res) => {
  try {
    const epic = new Epic({ ...req.body, createdBy: req.user._id });
    await epic.save();
    res.status(201).json(epic);
  } catch (err) {
    res.status(500).json({ message: "Error creating epic", error: err.message });
  }
};

exports.getEpics = async (req, res) => {
  try {
    const epics = await Epic.find().populate("project", "name");
    res.json(epics);
  } catch (err) {
    res.status(500).json({ message: "Error fetching epics", error: err.message });
  }
};

exports.updateEpic = async (req, res) => {
  try {
    const epic = await Epic.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(epic);
  } catch (err) {
    res.status(500).json({ message: "Error updating epic", error: err.message });
  }
};

exports.deleteEpic = async (req, res) => {
  try {
    await Epic.findByIdAndDelete(req.params.id);
    res.json({ message: "Epic deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting epic", error: err.message });
  }
};
