// controllers/dashboardController.js

const User = require("../models/User");
const Project = require("../models/Project");
const Sprint = require("../models/Sprint");
const UserStory = require("../models/UserStory");
const Task = require("../models/Task");
const Epic = require("../models/Epic");


exports.getDashboardData = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProjects = await Project.countDocuments();
    const totalSprints = await Sprint.countDocuments();
    const totalStories = await UserStory.countDocuments();

    res.json({
      users: totalUsers,
      projects: totalProjects,
      sprints: totalSprints,
      stories: totalStories
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch dashboard data", error: err.message });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const [totalProjects, totalUsers, totalSprints, totalStories] = await Promise.all([
      Project.countDocuments(),
      User.countDocuments(),
      Sprint.countDocuments(),
      UserStory.countDocuments(),
    ]);

    res.json({
      totalProjects,
      totalUsers,
      totalSprints,
      totalStories,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch dashboard data",
      error: error.message,
    });
  }
};

exports.getUserStoryInsights = async (req, res) => {
  try {
    const stories = await UserStory.find().populate("project").populate("epic");

    let insights = {
      totalStories: stories.length,
      projects: {},
      epics: {},
      acceptanceCriteriaCount: 0,
      dependenciesCount: 0,
      testCases: {
        total: 0,
        positive: 0,
        negative: 0,
      },
    };

    for (const story of stories) {
      const projectName = story.project?.name || "Unassigned Project";
      const epicName = story.epic?.name || "Unassigned Epic";

      // Count stories by project
      if (!insights.projects[projectName]) {
        insights.projects[projectName] = { total: 0, positive: 0, negative: 0 };
      }
      insights.projects[projectName].total++;
      insights.projects[projectName].positive += story.testCases.positive?.length || 0;
      insights.projects[projectName].negative += story.testCases.negative?.length || 0;

      // Count stories by epic
      if (!insights.epics[epicName]) {
        insights.epics[epicName] = { total: 0, positive: 0, negative: 0 };
      }
      insights.epics[epicName].total++;
      insights.epics[epicName].positive += story.testCases.positive?.length || 0;
      insights.epics[epicName].negative += story.testCases.negative?.length || 0;

      // Global counts
      insights.testCases.positive += story.testCases.positive?.length || 0;
      insights.testCases.negative += story.testCases.negative?.length || 0;
      insights.acceptanceCriteriaCount += story.acceptanceCriteria?.length || 0;
      insights.dependenciesCount += story.dependencies?.length || 0;
    }

    insights.testCases.total = insights.testCases.positive + insights.testCases.negative;

    res.json(insights);
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ message: "Dashboard insights failed", error: err.message });
  }
};

exports.getTaskStats = async (req, res) => {
  try {
    const tasks = await Task.find();

    const totalTasks = tasks.length;
    const statusCount = {
      "To Do": 0,
      "In Progress": 0,
      "Blocked": 0,
      "Done": 0,
    };

    let totalEstimated = 0;
    let totalActual = 0;

    for (const task of tasks) {
      totalEstimated += task.estimatedHours || 0;
      totalActual += task.actualHours || 0;
      if (statusCount[task.status] !== undefined) {
        statusCount[task.status]++;
      }
    }

    res.json({
      totalTasks,
      statusCount,
      totalEstimated,
      totalActual,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch task stats", error: err.message });
  }
};




// exports.getStats = async (req, res) => {
//   try {
//     const [totalProjects, totalUsers, totalSprints, totalStories] = await Promise.all([
//       Project.countDocuments(),
//       User.countDocuments(),
//       Sprint.countDocuments(),
//       UserStory.countDocuments(),
//     ]);

//     res.json({
//       totalProjects,
//       totalUsers,
//       totalSprints,
//       totalStories,
//     });
//   } catch (err) {
//     res.status(500).json({ message: "Failed to fetch stats", error: err.message });
//   }
// };

// exports.getUserStoryInsights = async (req, res) => {
//   try {
//     const stories = await UserStory.find().populate("project").populate("epic");

//     const data = {
//       projects: {},
//       epics: {},
//       testCases: { total: 0, positive: 0, negative: 0 },
//       acceptanceCriteriaCount: 0,
//       dependenciesCount: 0
//     };

//     for (const s of stories) {
//       if (s.testCases) {
//         const pos = s.testCases.positive?.length || 0;
//         const neg = s.testCases.negative?.length || 0;
//         data.testCases.total += pos + neg;
//         data.testCases.positive += pos;
//         data.testCases.negative += neg;

//         if (s.project) {
//           if (!data.projects[s.project.name]) {
//             data.projects[s.project.name] = { positive: 0, negative: 0 };
//           }
//           data.projects[s.project.name].positive += pos;
//           data.projects[s.project.name].negative += neg;
//         }

//         if (s.epic) {
//           if (!data.epics[s.epic.name]) {
//             data.epics[s.epic.name] = { positive: 0, negative: 0 };
//           }
//           data.epics[s.epic.name].positive += pos;
//           data.epics[s.epic.name].negative += neg;
//         }
//       }

//       if (s.acceptanceCriteria) {
//         data.acceptanceCriteriaCount += s.acceptanceCriteria.length;
//       }

//       if (s.dependencies) {
//         data.dependenciesCount += s.dependencies.length;
//       }
//     }

//     res.json(data);
//   } catch (err) {
//     res.status(500).json({ message: "Failed to fetch user story insights", error: err.message });
//   }
// };

// exports.getTaskStats = async (req, res) => {
//   try {
//     const roleNames = req.user.roles || [];
//     const isAdmin = roleNames.includes("Admin") || roleNames.includes("Management");

//     let tasks = [];
//     if (isAdmin) {
//       tasks = await Task.find().populate("assignedTo", "name");
//     } else {
//       tasks = await Task.find({ assignedTo: req.user._id }).populate("assignedTo", "name");
//     }

//     const statusCounts = {
//       "To Do": 0,
//       "In Progress": 0,
//       "Blocked": 0,
//       "Done": 0,
//     };
//     const userBreakdown = {};

//     for (const task of tasks) {
//       statusCounts[task.status] = (statusCounts[task.status] || 0) + 1;

//       if (isAdmin && task.assignedTo) {
//         const name = task.assignedTo.name;
//         if (!userBreakdown[name]) {
//           userBreakdown[name] = {
//             "To Do": 0,
//             "In Progress": 0,
//             "Blocked": 0,
//             "Done": 0,
//           };
//         }
//         userBreakdown[name][task.status]++;
//       }
//     }

//     res.json({
//       totalTasks: tasks.length,
//       statusCounts,
//       userBreakdown: isAdmin ? userBreakdown : undefined
//     });
//   } catch (err) {
//     res.status(500).json({ message: "Failed to fetch task stats", error: err.message });
//   }
// };