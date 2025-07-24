const express = require("express");
const router = express.Router();
const Project = require("../models/Project");
// const authMiddleware = require("../middlewares/authenticate");
const { authenticate } = require("../middlewares/authMiddleware");


// Create a new project
router.post("/", authenticate, async (req, res) => {
  try {
    const { name, description, startDate, endDate } = req.body;
    const newProject = new Project({ name, description, startDate, endDate });
    await newProject.save();
    res.status(201).json(newProject);
  } catch (err) {
    res.status(500).json({ message: "Error creating project", error: err.message });
  }
});

// Get all projects
router.get("/", authenticate, async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.status(200).json(projects);
  } catch (err) {
    res.status(500).json({ message: "Error fetching projects", error: err.message });
  }
});

// Update a project
router.put("/:id", authenticate, async (req, res) => {
  try {
    const updated = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: "Error updating project", error: err.message });
  }
});

// Delete a project
router.delete("/:id", authenticate, async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Project deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting project", error: err.message });
  }
});

module.exports = router;
