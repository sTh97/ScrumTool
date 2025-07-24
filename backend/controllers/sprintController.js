// controllers/sprintController.js
const Sprint = require("../models/Sprint");

exports.createSprint = async (req, res) => {
  try {
    const sprint = await Sprint.create(req.body);
    // console.log(req.body)
    res.status(201).json(sprint);
  } catch (err) {
    res.status(400).json({ message: "Error creating sprint", error: err.message });
  }
};

exports.getAllSprints = async (req, res) => {
  try {
    const sprints = await Sprint.find().populate("project").populate("epic");
    res.json(sprints);
    // console.log(sprints)
  } catch (err) {
    res.status(500).json({ message: "Error fetching sprints" });
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

// exports.assignTeamToSprint = async (req, res) => {
//   try {
//     const { teamMembers } = req.body;

//     const sprint = await Sprint.findById(req.params.id);
//     if (!sprint) return res.status(404).json({ message: "Sprint not found" });

//     // if (!sprint.project) {
//     //   return res.status(400).json({ message: "Cannot assign team: Sprint has no associated project" });
//     // }

//     sprint.teamMembers = teamMembers;
//     await sprint.save();
//     res.json(sprint);
//   } catch (err) {
//     res.status(500).json({ message: "Error assigning team to sprint", error: err.message });
//   }
// };

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



// exports.assignStoriesToSprint = async (req, res) => {
//   try {
//     const { userStories } = req.body; // stories = [{ storyId, tshirtSize, estimatedHours }]
//     // console.log(req.body)
//     const sprint = await Sprint.findById(req.params.id);
//     if (!sprint) return res.status(404).json({ message: "Sprint not found" });

//     // Validate entries if needed
//     sprint.userStories = userStories;
//     await sprint.save();
//     // console.log(sprint, "Check stories:", userStories, "Check userStories:", sprint.userStories)
//     res.json(sprint);
//   } catch (err) {
//     res.status(500).json({ message: "Error assigning stories to sprint", error: err.message });
//   }
// };

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


