// File: controllers/estimationController.js

const Estimation = require("../models/Estimation");

exports.createEstimation = async (req, res) => {
  try {
    const { label, hours } = req.body;
    const existing = await Estimation.findOne({ label });
    if (existing) return res.status(400).json({ message: "Estimation already exists" });

    const estimation = new Estimation({ label, hours });
    await estimation.save();
    res.status(201).json(estimation);
  } catch (err) {
    res.status(500).json({ message: "Failed to create estimation" });
  }
};

exports.getAllEstimations = async (req, res) => {
  try {
    const estimations = await Estimation.find().sort({ createdAt: -1 });
    res.json(estimations);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch estimations" });
  }
};

exports.updateEstimation = async (req, res) => {
  try {
    const { id } = req.params;
    const { label, hours } = req.body;
    const updated = await Estimation.findByIdAndUpdate(id, { label, hours }, { new: true });
    if (!updated) return res.status(404).json({ message: "Estimation not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Failed to update estimation" });
  }
};

exports.deleteEstimation = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Estimation.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Estimation not found" });
    res.json({ message: "Estimation deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete estimation" });
  }
};
