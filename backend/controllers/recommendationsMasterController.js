const RecommendationsMaster = require("../models/RecommendationsMaster");

exports.getAllRecommendations = async (req, res) => {
  try {
    const recommendations = await RecommendationsMaster.find().sort("name");
    res.json(recommendations);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch recommendations" });
  }
};

exports.createRecommendation = async (req, res) => {
  try {
    const newRec = new RecommendationsMaster({ name: req.body.name });
    await newRec.save();
    res.status(201).json(newRec);
  } catch (err) {
    res.status(400).json({ message: "Failed to create", error: err.message });
  }
};

exports.updateRecommendation = async (req, res) => {
  try {
    const updated = await RecommendationsMaster.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: "Failed to update", error: err.message });
  }
};

exports.deleteRecommendation = async (req, res) => {
  try {
    await RecommendationsMaster.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(400).json({ message: "Failed to delete", error: err.message });
  }
};
