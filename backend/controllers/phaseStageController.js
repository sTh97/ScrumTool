const PhaseStage = require("../models/PhaseStage");

exports.getAllPhases = async (req, res) => {
  try {
    const data = await PhaseStage.find();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch phases", error: err.message });
  }
};

exports.createPhase = async (req, res) => {
  try {
    const newPhase = new PhaseStage(req.body);
    await newPhase.save();
    res.status(201).json(newPhase);
  } catch (err) {
    res.status(400).json({ message: "Failed to create phase", error: err.message });
  }
};

exports.updatePhase = async (req, res) => {
  try {
    const updated = await PhaseStage.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: "Failed to update phase", error: err.message });
  }
};

exports.deletePhase = async (req, res) => {
  try {
    await PhaseStage.findByIdAndDelete(req.params.id);
    res.json({ message: "Phase deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete phase", error: err.message });
  }
};
