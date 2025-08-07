// controllers/sprintController.js
const Sprint = require("../models/Sprint");
const User = require("../models/User");
const Epic = require("../models/Epic");
const Project = require("../models/Project");
const UserStory = require("../models/UserStory");

exports.createSprint = async (req, res) => {
  try {
    const sprint = await Sprint.create(req.body);
    // console.log(req.body)
    res.status(201).json(sprint);
  } catch (err) {
    res.status(400).json({ message: "Error creating sprint", error: err.message });
  }
};

exports.updateSprint = async (req, res) => {
  try {
    const updated = await Sprint.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: "Error updating sprint" });
  }
};

exports.deleteSprint = async (req, res) => {
  try {
    await Sprint.findByIdAndDelete(req.params.id);
    res.json({ message: "Sprint deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting sprint" });
  }
};

exports.assignTeamToSprint = async (req, res) => {
  try {
    const { teamMembers } = req.body;

    const sprint = await Sprint.findById(req.params.id);
    if (!sprint) {
      return res.status(404).json({ message: "Sprint not found" });
    }

    await Sprint.updateOne(
      { _id: req.params.id },
      { teamMembers }
    );

    res.json({ message: "Team assigned successfully." });
  } catch (err) {
    res.status(500).json({ message: "Error assigning team to sprint", error: err.message });
  }
};

exports.assignStoriesToSprint = async (req, res) => {
  try {
    const { userStories } = req.body;

    const sprint = await Sprint.findById(req.params.id);
    if (!sprint) return res.status(404).json({ message: "Sprint not found" });

    await Sprint.updateOne(
      { _id: req.params.id },
      { userStories }
    );

    res.json({ message: "User stories assigned successfully." });
  } catch (err) {
    res.status(500).json({ message: "Error assigning stories to sprint", error: err.message });
  }
};


exports.assignTeamToSprint = async (req, res) => {
  try {
    const { teamMembers } = req.body;

    const sprint = await Sprint.findById(req.params.id);
    if (!sprint) {
      return res.status(404).json({ message: "Sprint not found" });
    }

    await Sprint.updateOne(
      { _id: req.params.id },
      { teamMembers }
    );

    res.json({ message: "Team assigned successfully." });
  } catch (err) {
    res.status(500).json({ message: "Error assigning team to sprint", error: err.message });
  }
};

// Get single sprint with team and user stories populated
exports.getSprintDetails = async (req, res) => {
  try {
    const sprint = await Sprint.findById(req.params.id)
      // .populate("teamMembers", "name email role") // You can choose the fields to return
      // .populate("userStories.storyId", "title project") // Populating nested storyId
      .populate('project')
      .populate('epic') // ✅ Epic reference
      .populate('teamMembers') // ✅ User references
      .populate('userStories.storyId'); // ✅ Nested population
      //  res.status(200).json(sprints);
      console.log(sprint)

    if (!sprint) return res.status(404).json({ message: "Sprint not found" });

    res.json(sprint);
  } catch (err) {
    res.status(500).json({ message: "Error fetching sprint details", error: err.message });
  }
};

// controllers/sprintController.js
exports.getAllSprints = async (req, res) => {
  try {
    const sprints = await Sprint.find()
      .populate('project')
      .populate('epic') // ✅ Epic reference
      .populate('teamMembers') // ✅ User references
      .populate('userStories.storyId'); // ✅ Nested population
    res.status(200).json(sprints);
    console.log(sprints)
  } catch (err) {
    res.status(500).json({ message: 'Error fetching sprints', error: err.message });
  }
};

// exports.getAllSprintsPagination = async (req, res) => {
//   try {
//     const { search = "", page = 1, limit = 3 } = req.query;

//     const query = {
//       $or: [
//         { name: { $regex: search, $options: "i" } },
//       ]
//     };

//     // Search for matching Users, Epics, Projects, User Stories
//     const [users, epics, projects, stories] = await Promise.all([
//       User.find({ name: { $regex: search, $options: "i" } }).select("_id"),
//       Epic.find({ name: { $regex: search, $options: "i" } }).select("_id"),
//       Project.find({ name: { $regex: search, $options: "i" } }).select("_id"),
//       UserStory.find({ title: { $regex: search, $options: "i" } }).select("_id"),
//     ]);

//     // If matches found, expand the $or condition
//     if (users.length > 0 || epics.length > 0 || projects.length > 0 || stories.length > 0) {
//       query.$or.push(
//         { teamMembers: { $in: users.map(u => u._id) } },
//         { epic: { $in: epics.map(e => e._id) } },
//         { project: { $in: projects.map(p => p._id) } },
//         { "userStories.storyId": { $in: stories.map(s => s._id) } }
//       );
//     }

//     const sprints = await Sprint.find(query)
//       .populate("project")
//       .populate("epic")
//       .populate("teamMembers")
//       .populate("userStories.storyId")
//       .sort({ createdAt: -1 })
//       .skip((page - 1) * limit)
//       .limit(parseInt(limit));

//     const total = await Sprint.countDocuments(query);

//     res.status(200).json({
//       sprints,
//       total,
//       page: parseInt(page),
//       totalPages: Math.ceil(total / limit),
//     });
//   } catch (err) {
//     console.error("Error fetching sprints:", err);
//     res.status(500).json({ message: "Error fetching sprints", error: err.message });
//   }
// };



