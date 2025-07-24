// File: controllers/sprintController.js

const Sprint = require("../models/Sprint");

exports.getAllSprints = async (req, res) => {
  try {
    const sprints = await Sprint.find()
      .populate("project")
      .populate("epic")
      .populate("teamMembers", "name email")
      .populate("userStories.storyId");
    res.json(sprints);
  } catch (err) {
    res.status(500).json({ message: "Error fetching sprints" });
  }
};

exports.createSprint = async (req, res) => {
  try {
    const sprint = await Sprint.create(req.body);
    res.status(201).json(sprint);
  } catch (err) {
    res.status(400).json({ message: "Error creating sprint" });
  }
};

exports.getSprintById = async (req, res) => {
  try {
    const sprint = await Sprint.findById(req.params.id);
    if (!sprint) return res.status(404).json({ message: "Sprint not found" });
    res.json(sprint);
  } catch (err) {
    res.status(500).json({ message: "Error fetching sprint" });
  }
};

exports.updateSprint = async (req, res) => {
  try {
    const sprint = await Sprint.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!sprint) return res.status(404).json({ message: "Sprint not found" });
    res.json(sprint);
  } catch (err) {
    res.status(400).json({ message: "Error updating sprint" });
  }
};

exports.deleteSprint = async (req, res) => {
  try {
    const sprint = await Sprint.findByIdAndDelete(req.params.id);
    if (!sprint) return res.status(404).json({ message: "Sprint not found" });
    res.json({ message: "Sprint deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting sprint" });
  }
};

exports.assignTeamToSprint = async (req, res) => {
  try {
    const { teamMembers } = req.body;
    const sprint = await Sprint.findByIdAndUpdate(
      req.params.id,
      { teamMembers },
      { new: true }
    );
    if (!sprint) return res.status(404).json({ message: "Sprint not found" });
    res.json(sprint);
  } catch (err) {
    res.status(400).json({ message: "Error assigning team to sprint" });
  }
};

exports.assignStoriesToSprint = async (req, res) => {
  try {
    const { userStories } = req.body; // Array of { storyId, tshirtSize, estimatedHours }
    const sprint = await Sprint.findByIdAndUpdate(
      req.params.id,
      { userStories },
      { new: true }
    );
    if (!sprint) return res.status(404).json({ message: "Sprint not found" });
    res.json(sprint);
  } catch (err) {
    res.status(400).json({ message: "Error assigning stories to sprint" });
  }
};
