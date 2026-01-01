// const express = require("express");
// const router = express.Router();
// const Project = require("../models/Project");
// // const authMiddleware = require("../middlewares/authenticate");
// const { authenticate } = require("../middlewares/authMiddleware");


// // Create a new project
// router.post("/", authenticate, async (req, res) => {
//   try {
//     const { name, description, startDate, endDate } = req.body;
//     const newProject = new Project({ name, description, startDate, endDate });
//     await newProject.save();
//     res.status(201).json(newProject);
//   } catch (err) {
//     res.status(500).json({ message: "Error creating project", error: err.message });
//   }
// });

// // Get all projects
// router.get("/", authenticate, async (req, res) => {
//   try {
//     const projects = await Project.find().sort({ createdAt: -1 });
//     res.status(200).json(projects);
//   } catch (err) {
//     res.status(500).json({ message: "Error fetching projects", error: err.message });
//   }
// });

// // Update a project
// router.put("/:id", authenticate, async (req, res) => {
//   try {
//     const updated = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
//     res.status(200).json(updated);
//   } catch (err) {
//     res.status(500).json({ message: "Error updating project", error: err.message });
//   }
// });

// // Delete a project
// router.delete("/:id", authenticate, async (req, res) => {
//   try {
//     await Project.findByIdAndDelete(req.params.id);
//     res.status(200).json({ message: "Project deleted successfully" });
//   } catch (err) {
//     res.status(500).json({ message: "Error deleting project", error: err.message });
//   }
// });

// module.exports = router;


// backend/routes/projectRoutes.js
const express = require("express");
const router = express.Router();
const Project = require("../models/Project");
const { authenticate } = require("../middlewares/authMiddleware");

// OPTIONAL: if you want the creator to become a member (Owner) automatically
const ProjectMember = require("../models/ProjectMember");

/**
 * Create a new project
 * Also (optionally) add the creator as an Owner member so workspace routes won't 403.
 */
router.post("/", authenticate, async (req, res) => {
  try {
    const { name, description, startDate, endDate, code } = req.body;

    const project = await Project.create({
      name,
      description: description || "",
      startDate: startDate || null,
      endDate: endDate || null,
      code: code || undefined,
    });

    // ---- Optional convenience: ensure creator is a member (Owner) ----
    try {
      if (req.user?._id) {
        await ProjectMember.updateOne(
          { projectId: project._id, userId: req.user._id },
          {
            $setOnInsert: {
              projectId: project._id,
              userId: req.user._id,
              role: "Owner",
              addedBy: req.user._id,
              addedAt: new Date(),
            },
          },
          { upsert: true }
        );
      }
    } catch (_) {
      // don't block project creation if membership insert fails
    }

    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: "Error creating project", error: err.message });
  }
});

/**
 * Get all projects
 */
router.get("/", authenticate, async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.status(200).json(projects);
  } catch (err) {
    res.status(500).json({ message: "Error fetching projects", error: err.message });
  }
});

/**
 * Get a single project by ID  <-- NEW
 */
router.get("/:id", authenticate, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    // return plain document; your frontend handles either shape
    res.status(200).json(project);
  } catch (err) {
    res.status(500).json({ message: "Error fetching project", error: err.message });
  }
});

/**
 * Update a project
 */
router.put("/:id", authenticate, async (req, res) => {
  try {
    const updated = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Project not found" });
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: "Error updating project", error: err.message });
  }
});

/**
 * Delete a project
 */
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const removed = await Project.findByIdAndDelete(req.params.id);
    if (!removed) return res.status(404).json({ message: "Project not found" });
    res.status(200).json({ message: "Project deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting project", error: err.message });
  }
});

module.exports = router;
