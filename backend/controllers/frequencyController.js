const Frequency = require("../models/Frequency");

exports.getAllFrequencies = async (req, res) => {
  try {
    const frequencies = await Frequency.find().sort("name");
    res.json(frequencies);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch frequencies", error: err.message });
  }
};

exports.createFrequency = async (req, res) => {
  try {
    const { name } = req.body;
    const frequency = new Frequency({ name });
    await frequency.save();
    res.status(201).json(frequency);
  } catch (err) {
    res.status(400).json({ message: "Failed to create frequency", error: err.message });
  }
};

exports.updateFrequency = async (req, res) => {
  try {
    const { name } = req.body;
    const frequency = await Frequency.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true }
    );
    if (!frequency) return res.status(404).json({ message: "Frequency not found" });
    res.json(frequency);
  } catch (err) {
    res.status(400).json({ message: "Failed to update frequency", error: err.message });
  }
};

exports.deleteFrequency = async (req, res) => {
  try {
    const frequency = await Frequency.findByIdAndDelete(req.params.id);
    if (!frequency) return res.status(404).json({ message: "Frequency not found" });
    res.json({ message: "Frequency deleted" });
  } catch (err) {
    res.status(400).json({ message: "Failed to delete frequency", error: err.message });
  }
};
