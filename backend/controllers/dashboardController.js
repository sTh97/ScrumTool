// // controllers/dashboardController.js

// const User = require("../models/User");
// const Project = require("../models/Project");
// const Sprint = require("../models/Sprint");
// const UserStory = require("../models/UserStory");
// const Task = require("../models/Task");
// const Epic = require("../models/Epic");


// exports.getDashboardData = async (req, res) => {
//   try {
//     const totalUsers = await User.countDocuments();
//     const totalProjects = await Project.countDocuments();
//     const totalSprints = await Sprint.countDocuments();
//     const totalStories = await UserStory.countDocuments();

//     res.json({
//       users: totalUsers,
//       projects: totalProjects,
//       sprints: totalSprints,
//       stories: totalStories
//     });
//   } catch (err) {
//     res.status(500).json({ message: "Failed to fetch dashboard data", error: err.message });
//   }
// };

// exports.getDashboardStats = async (req, res) => {
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
//     console.log("HIT /dashboard/stats as:", { id: req.user?.id, roles: (req.user?.roles||[]).map(r=>r.name) });
//   } catch (error) {
//     res.status(500).json({
//       message: "Failed to fetch dashboard data",
//       error: error.message,
//     });
//   }
// };

// exports.getUserStoryInsights = async (req, res) => {
//   try {
//     const stories = await UserStory.find().populate("project").populate("epic");

//     let insights = {
//       totalStories: stories.length,
//       projects: {},
//       epics: {},
//       acceptanceCriteriaCount: 0,
//       dependenciesCount: 0,
//       testCases: {
//         total: 0,
//         positive: 0,
//         negative: 0,
//       },
//     };

//     for (const story of stories) {
//       const projectName = story.project?.name || "Unassigned Project";
//       const epicName = story.epic?.name || "Unassigned Epic";

//       // Count stories by project
//       if (!insights.projects[projectName]) {
//         insights.projects[projectName] = { total: 0, positive: 0, negative: 0 };
//       }
//       insights.projects[projectName].total++;
//       insights.projects[projectName].positive += story.testCases.positive?.length || 0;
//       insights.projects[projectName].negative += story.testCases.negative?.length || 0;

//       // Count stories by epic
//       if (!insights.epics[epicName]) {
//         insights.epics[epicName] = { total: 0, positive: 0, negative: 0 };
//       }
//       insights.epics[epicName].total++;
//       insights.epics[epicName].positive += story.testCases.positive?.length || 0;
//       insights.epics[epicName].negative += story.testCases.negative?.length || 0;

//       // Global counts
//       insights.testCases.positive += story.testCases.positive?.length || 0;
//       insights.testCases.negative += story.testCases.negative?.length || 0;
//       insights.acceptanceCriteriaCount += story.acceptanceCriteria?.length || 0;
//       insights.dependenciesCount += story.dependencies?.length || 0;
//     }

//     insights.testCases.total = insights.testCases.positive + insights.testCases.negative;

//     res.json(insights);
//   } catch (err) {
//     console.error("Dashboard error:", err);
//     res.status(500).json({ message: "Dashboard insights failed", error: err.message });
//   }
// };

// exports.getTaskStats = async (req, res) => {
//   try {
//     const tasks = await Task.find();

//     const totalTasks = tasks.length;
//     const statusCount = {
//       "To Do": 0,
//       "In Progress": 0,
//       "Blocked": 0,
//       "Done": 0,
//     };

//     let totalEstimated = 0;
//     let totalActual = 0;

//     for (const task of tasks) {
//       totalEstimated += task.estimatedHours || 0;
//       totalActual += task.actualHours || 0;
//       if (statusCount[task.status] !== undefined) {
//         statusCount[task.status]++;
//       }
//     }

//     res.json({
//       totalTasks,
//       statusCount,
//       totalEstimated,
//       totalActual,
//     });
//   } catch (err) {
//     res.status(500).json({ message: "Failed to fetch task stats", error: err.message });
//   }
// };



// =================================
// controllers/dashboardController.js (updated)
// =================================
// controllers/dashboardController.js
// controllers/dashboardController.js
// controllers/dashboardController.js
// controllers/dashboardController.js
const mongoose = require("mongoose");
const User = require("../models/User");
const Project = require("../models/Project");
const Sprint = require("../models/Sprint");
const UserStory = require("../models/UserStory");
const Task = require("../models/Task");

const isPrivileged = (roles) => {
  const names = (roles || []).map((r) => (typeof r === "string" ? r : r.name));
  return ["Admin", "System Administrator", "Project Manager"].some((r) => names.includes(r));
};

const isSupervisor = (roles) => {
  const names = (roles || []).map((r) => (typeof r === "string" ? r : r.name));
  return names.includes("Senior Project Supervisor") || names.includes("Scrum Master") || names.includes("Sub Admin");
};

// ---- Legacy v1 (kept) ----
exports.getDashboardData = async (req, res) => {
  try {
    const [totalUsers, totalProjects, totalSprints, totalStories] = await Promise.all([
      User.countDocuments(),
      Project.countDocuments(),
      Sprint.countDocuments(),
      UserStory.countDocuments(),
    ]);
    res.json({ users: totalUsers, projects: totalProjects, sprints: totalSprints, stories: totalStories });
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
    res.json({ totalProjects, totalUsers, totalSprints, totalStories });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch dashboard data", error: error.message });
  }
};

// Now supports ?scope=mine  (no sprintId usage on UserStory)
exports.getUserStoryInsights = async (req, res) => {
  try {
    const scopeMine = (req.query.scope || "").toLowerCase() === "mine";
    const userId = req.user?.id;

    let storyQuery = {};
    if (scopeMine && userId) {
      const myTaskStoryIds = await Task.find({ assignedTo: userId }).distinct("userStoryId");
      storyQuery = { _id: { $in: myTaskStoryIds } };
    }

    const stories = await UserStory.find(storyQuery).populate("project").populate("epic");

    const insights = {
      totalStories: stories.length,
      projects: {},
      epics: {},
      acceptanceCriteriaCount: 0,
      dependenciesCount: 0,
      testCases: { total: 0, positive: 0, negative: 0 },
    };

    for (const story of stories) {
      const projectName = story.project?.name || "Unassigned Project";
      const epicName = story.epic?.name || "Unassigned Epic";

      insights.projects[projectName] ||= { total: 0, positive: 0, negative: 0 };
      insights.projects[projectName].total++;
      insights.projects[projectName].positive += story.testCases?.positive?.length || 0;
      insights.projects[projectName].negative += story.testCases?.negative?.length || 0;

      insights.epics[epicName] ||= { total: 0, positive: 0, negative: 0 };
      insights.epics[epicName].total++;
      insights.epics[epicName].positive += story.testCases?.positive?.length || 0;
      insights.epics[epicName].negative += story.testCases?.negative?.length || 0;

      insights.testCases.positive += story.testCases?.positive?.length || 0;
      insights.testCases.negative += story.testCases?.negative?.length || 0;
      insights.acceptanceCriteriaCount += story.acceptanceCriteria?.length || 0;
      insights.dependenciesCount += story.dependencies?.length || 0;
    }

    insights.testCases.total = insights.testCases.positive + insights.testCases.negative;
    res.json(insights);
  } catch (err) {
    res.status(500).json({ message: "Dashboard insights failed", error: err.message });
  }
};

// Now supports ?scope=mine
exports.getTaskStats = async (req, res) => {
  try {
    const scopeMine = (req.query.scope || "").toLowerCase() === "mine";
    const userId = req.user?.id;
    const query = scopeMine && userId ? { assignedTo: userId } : {};

    const tasks = await Task.find(query).select(
      "status estimatedHours actualHours startedAt completedAt statusChangeLog assignedTo sprintId"
    );

    const totalTasks = tasks.length;
    const statusCount = { "To Do": 0, "In Progress": 0, Paused: 0, Blocked: 0, Done: 0 };

    let totalEstimated = 0;
    let totalActual = 0;
    let throughput30d = 0;
    const now = new Date();
    const cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    for (const t of tasks) {
      totalEstimated += t.estimatedHours || 0;
      totalActual += t.actualHours || 0;
      if (statusCount[t.status] !== undefined) statusCount[t.status]++;
      if (t.completedAt && t.completedAt >= cutoff) throughput30d++;
    }

    res.json({ totalTasks, statusCount, totalEstimated, totalActual, throughput30d });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch task stats", error: err.message });
  }
};

// -------- V2: Role-aware analytics + project filter + window --------
// GET /api/dashboard/v2?windowDays=30&projectId=<id>
exports.getDashboardV2 = async (req, res) => {
  try {
    const roles = req.user?.roles || [];
    const userId = req.user?.id;
    const privileged = isPrivileged(roles);
    const supervisor = isSupervisor(roles);
    const windowDays = Math.max(1, Math.min(parseInt(req.query.windowDays || 30, 10), 180));
    const now = new Date();
    const cutoff = new Date(now.getTime() - windowDays * 24 * 60 * 60 * 1000);
    const projectId =
      req.query.projectId && mongoose.isValidObjectId(req.query.projectId)
        ? new mongoose.Types.ObjectId(req.query.projectId)
        : null;

    // Available projects for the filter
    const availableProjects = await Project.find({}).select("name");

    // Scope setup
    let sprintQuery = {};
    let storyQuery = {};
    let taskQuery = {};

    // Apply project filter (UserStory has `project`, Sprint has `project`)
    if (projectId) {
      sprintQuery.project = projectId;
      storyQuery.project = projectId;
    }

    if (!privileged) {
      if (supervisor) {
        // Full visibility retained (project filter already applied if any)
      } else if (userId) {
        // Dev/Tester scope
        sprintQuery = { ...(sprintQuery || {}), teamMembers: userId };
        taskQuery = { assignedTo: userId };
        // storyQuery will be narrowed later to only the stories touched by these tasks if no projectId provided
      }
    }

    // Fetch sprints + (project-scoped) stories
    const [sprints, storiesBase] = await Promise.all([
      Sprint.find(sprintQuery)
        .select("name startDate endDate teamMembers project epic")
        .populate("teamMembers", "name")
        .populate("project", "name")
        .populate("epic", "name"),
      UserStory.find(storyQuery)
        .select("project epic acceptanceCriteria dependencies testCases")
        .populate("project", "name")
        .populate("epic", "name"),
    ]);

    // Build task query; filter by project using sprint/story linkage (Task has NO projectId)
    if (projectId) {
      const sprintIds = sprints.map((s) => s._id);
      const storyIds = storiesBase.map((s) => s._id);
      taskQuery = {
        ...(taskQuery || {}),
        $or: [{ sprintId: { $in: sprintIds } }, { userStoryId: { $in: storyIds } }],
      };
    }

    // Fetch tasks now (populate only paths that exist)
    const tasks = await Task.find(taskQuery)
      .select(
        "title status estimatedHours actualHours startedAt completedAt statusChangeLog assignedTo sprintId userStoryId"
      ) // ^ added `title`
      .populate("assignedTo", "name")
      .populate("sprintId", "name startDate endDate project")
      .populate("userStoryId", "project epic");

    // If scope=Dev/Tester (no project filter), restrict stories to those tied to their tasks
    let stories = storiesBase;
    if (!privileged && !supervisor && !projectId) {
      const myStoryIds = [
        ...new Set(tasks.map((t) => t.userStoryId).filter(Boolean).map((id) => String(id._id || id))),
      ];
      stories = await UserStory.find({ _id: { $in: myStoryIds } })
        .select("project epic acceptanceCriteria dependencies testCases")
        .populate("project", "name")
        .populate("epic", "name");
    }

    // Totals (respect scope + project)
    const [projectsScoped, usersScoped] = await Promise.all([
      Project.find(projectId ? { _id: projectId } : {}).select("_id name"),
      User.find({}).select("_id"),
    ]);

    const baseStats = {
      totals: {
        projects: projectsScoped.length,
        users: usersScoped.length,
        sprints: sprints.length,
        stories: stories.length,
        tasks: tasks.length,
      },
    };

    // Active sprint health with status mix
    const activeSprints = sprints.filter((s) => s.startDate <= now && s.endDate >= now);
    const sprintHealth = activeSprints.map((s) => {
      const tForSprint = tasks.filter((t) => String(t.sprintId?._id || t.sprintId) === String(s._id));
      return {
        sprintId: s._id,
        name: s.name,
        project: s.project?.name,
        epic: s.epic?.name,
        teamSize: (s.teamMembers || []).length,
        estHours: tForSprint.reduce((a, b) => a + (b.estimatedHours || 0), 0),
        actHours: tForSprint.reduce((a, b) => a + (b.actualHours || 0), 0),
        status: {
          todo: tForSprint.filter((t) => t.status === "To Do").length,
          inProgress: tForSprint.filter((t) => t.status === "In Progress").length,
          paused: tForSprint.filter((t) => t.status === "Paused").length,
          blocked: tForSprint.filter((t) => t.status === "Blocked").length,
          done: tForSprint.filter((t) => t.status === "Done").length,
        },
        throughputWindow: tForSprint.filter((t) => t.completedAt && t.completedAt >= cutoff).length,
      };
    });

    // Per-project rollups (only for projects in scope)
    const projectMap = new Map();
    for (const p of projectsScoped) {
      projectMap.set(String(p._id), {
        projectId: String(p._id),
        name: p.name || "(Unknown Project)",
        status: { todo: 0, inProgress: 0, paused: 0, blocked: 0, done: 0 },
        est: 0,
        act: 0,
        throughputWindow: 0,
        stories: 0,
        ac: 0,
        tcPos: 0,
        tcNeg: 0,
      });
    }

    for (const t of tasks) {
      // Derive project from userStory.project, else fallback to sprint.project
      const pid =
        (t.userStoryId && (t.userStoryId.project?._id || t.userStoryId.project)) ||
        (t.sprintId && (t.sprintId.project?._id || t.sprintId.project)) ||
        null;
      if (!pid) continue;
      const key = String(pid);
      if (!projectMap.has(key)) continue;
      const rec = projectMap.get(key);
      rec.est += t.estimatedHours || 0;
      rec.act += t.actualHours || 0;
      if (t.completedAt && t.completedAt >= cutoff) rec.throughputWindow++;
      if (t.status === "To Do") rec.status.todo++;
      else if (t.status === "In Progress") rec.status.inProgress++;
      else if (t.status === "Paused") rec.status.paused++;
      else if (t.status === "Blocked") rec.status.blocked++;
      else if (t.status === "Done") rec.status.done++;
    }

    for (const s of stories) {
      const pid = s.project?._id || s.project;
      if (!pid) continue;
      const key = String(pid);
      if (!projectMap.has(key)) continue;
      const rec = projectMap.get(key);
      rec.stories += 1;
      rec.ac += s.acceptanceCriteria?.length || 0;
      rec.tcPos += s.testCases?.positive?.length || 0;
      rec.tcNeg += s.testCases?.negative?.length || 0;
    }

    const perProject = Array.from(projectMap.values());

    // Per-sprint details + burndown series
    const perSprint = sprints.map((s) => {
      const tForSprint = tasks.filter((t) => String(t.sprintId?._id || t.sprintId) === String(s._id));
      const status = {
        todo: tForSprint.filter((t) => t.status === "To Do").length,
        inProgress: tForSprint.filter((t) => t.status === "In Progress").length,
        paused: tForSprint.filter((t) => t.status === "Paused").length,
        blocked: tForSprint.filter((t) => t.status === "Blocked").length,
        done: tForSprint.filter((t) => t.status === "Done").length,
      };
      // Simple burndown: remaining estimated hours per day
      const days = [];
      const start = new Date(s.startDate);
      const end = new Date(s.endDate);
      let remaining = tForSprint.reduce((a, b) => a + (b.estimatedHours || 0), 0);
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const doneToday = tForSprint
          .filter((t) => t.completedAt && new Date(t.completedAt).toDateString() === d.toDateString())
          .reduce((a, b) => a + (b.estimatedHours || 0), 0);
        remaining = Math.max(0, remaining - doneToday);
        days.push({ date: new Date(d), remaining });
      }
      return {
        sprintId: s._id,
        name: s.name,
        project: s.project?.name,
        epic: s.epic?.name,
        status,
        estHours: tForSprint.reduce((a, b) => a + (b.estimatedHours || 0), 0),
        actHours: tForSprint.reduce((a, b) => a + (b.actualHours || 0), 0),
        burndown: days,
      };
    });

    // Per-member utilization with per-status
    const utilMap = new Map();
    for (const t of tasks) {
      const uid = t.assignedTo?._id ? String(t.assignedTo._id) : String(t.assignedTo || "");
      if (!uid) continue;
      if (!utilMap.has(uid))
        utilMap.set(uid, {
          userId: uid,
          name: t.assignedTo?.name || "Unassigned",
          est: 0,
          act: 0,
          open: 0,
          done: 0,
          inProgress: 0,
          paused: 0,
          blocked: 0,
        });
      const rec = utilMap.get(uid);
      rec.est += t.estimatedHours || 0;
      rec.act += t.actualHours || 0;
      if (t.status === "Done") rec.done++;
      else rec.open++;
      if (t.status === "In Progress") rec.inProgress++;
      if (t.status === "Paused") rec.paused++;
      if (t.status === "Blocked") rec.blocked++;
    }
    const perMember = Array.from(utilMap.values()).sort((a, b) => b.est - a.est);

    // Efficiency (avg cycle hours) & throughput window per member
    const effMap = new Map();
    for (const t of tasks) {
      const uid = t.assignedTo?._id ? String(t.assignedTo._id) : String(t.assignedTo || "");
      if (!uid) continue;
      if (!effMap.has(uid))
        effMap.set(uid, {
          userId: uid,
          name: t.assignedTo?.name || "Unassigned",
          count: 0,
          sum: 0,
          throughputWindow: 0,
        });
      const rec = effMap.get(uid);
      if (t.completedAt) {
        const started = t.startedAt || t.statusChangeLog?.find((x) => x.status === "In Progress")?.changedAt;
        if (started) {
          const hours = (new Date(t.completedAt) - new Date(started)) / 36e5;
          rec.count += 1;
          rec.sum += hours;
        }
        if (t.completedAt >= cutoff) rec.throughputWindow += 1;
      }
    }
    const memberEfficiency = Array.from(effMap.values()).map((r) => ({
      ...r,
      avgCycleHours: r.count ? +(r.sum / r.count).toFixed(2) : null,
    }));

    // Throughput by day (window)
    const daysMap = new Map();
    for (let i = windowDays - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().slice(0, 10);
      daysMap.set(key, 0);
    }
    for (const t of tasks) {
      if (t.completedAt && t.completedAt >= cutoff) {
        const key = new Date(t.completedAt).toISOString().slice(0, 10);
        if (daysMap.has(key)) daysMap.set(key, daysMap.get(key) + 1);
      }
    }
    const throughputByDay = Array.from(daysMap.entries()).map(([date, count]) => ({ date, count }));

    // Risk: aging paused/blocked >= 3 days
    const risk = tasks
      .filter((t) => ["Paused", "Blocked"].includes(t.status))
      .map((t) => {
        const lastChange = (t.statusChangeLog || [])
          .slice()
          .reverse()
          .find((x) => x.status === t.status);
        const since = lastChange?.changedAt ? (now - new Date(lastChange.changedAt)) / 86400000 : null;
        return {
          taskId: String(t._id),
          assignee: t.assignedTo?.name || "Unassigned",
          status: t.status,
          daysInStatus: since ? +since.toFixed(1) : null,
        };
      })
      .filter((x) => (x.daysInStatus ?? 0) >= 3)
      .sort((a, b) => b.daysInStatus - a.daysInStatus);

    // NEW: WIP (In Progress) list with assignee / project / sprint
    const wip = tasks
      .filter((t) => t.status === "In Progress")
      .map((t) => {
        const lastChange = (t.statusChangeLog || [])
          .slice()
          .reverse()
          .find((x) => x.status === "In Progress");
        const days = lastChange?.changedAt ? (now - new Date(lastChange.changedAt)) / 86400000 : null;

        // Project name: prefer userStory.project -> sprint.project -> null
        const projectName =
          (t.userStoryId && t.userStoryId.project && t.userStoryId.project.name)
            ? t.userStoryId.project.name
            : (t.sprintId && t.sprintId.project && t.sprintId.project.name)
              ? t.sprintId.project.name
              : null;

        return {
          taskId: String(t._id),
          title: t.title,
          assignee: t.assignedTo?.name || "Unassigned",
          sprint: t.sprintId?.name || null,
          project: projectName,
          daysInStatus: days ? +days.toFixed(1) : null,
        };
      })
      .sort((a, b) => (b.daysInStatus || 0) - (a.daysInStatus || 0));

    res.json({
      meta: { windowDays, now, projectId: projectId ? String(projectId) : null },
      availableProjects, // [{_id, name}]
      role: { privileged, supervisor, roles: (roles || []).map((r) => r.name || r) },
      baseStats,
      perProject,
      perSprint,
      perMember,
      memberEfficiency,
      sprintHealth,
      series: { throughputByDay },
      risk,
      wip, // <-- NEW
      quality: {
        acceptanceCriteria: stories.reduce((a, s) => a + (s.acceptanceCriteria?.length || 0), 0),
        dependencies: stories.reduce((a, s) => a + (s.dependencies?.length || 0), 0),
        testCases: {
          positive: stories.reduce((a, s) => a + (s.testCases?.positive?.length || 0), 0),
          negative: stories.reduce((a, s) => a + (s.testCases?.negative?.length || 0), 0),
        },
      },
    });
  } catch (err) {
    console.error("/dashboard/v2 error", err);
    res.status(500).json({ message: "Failed to build dashboard", error: err.message });
  }
};

exports.getDashboardMine = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(400).json({ message: "Missing user" });

    const windowDays = Math.max(1, Math.min(parseInt(req.query.windowDays || 30, 10), 180));
    const now = new Date();
    const cutoff = new Date(now.getTime() - windowDays * 24 * 60 * 60 * 1000);
    const projectId =
      req.query.projectId && mongoose.isValidObjectId(req.query.projectId)
        ? new mongoose.Types.ObjectId(req.query.projectId)
        : null;

    // All sprints where the user is a team member (for filter lists)
    const mySprints = await Sprint.find({ teamMembers: userId })
      .select("name project startDate endDate")
      .populate("project", "name");

    // Personal tasks (+ optional project filter by sprint.project)
    let taskQuery = { assignedTo: userId };
    if (projectId) {
      const sprintIds = mySprints.filter((s) => String(s.project?._id || s.project) === String(projectId)).map((s) => s._id);
      taskQuery = { ...taskQuery, sprintId: { $in: sprintIds } };
    }

    const tasks = await Task.find(taskQuery)
      .select("title status estimatedHours actualHours startedAt completedAt statusChangeLog sprintId userStoryId")
      .populate("sprintId", "name project startDate endDate")
      .populate("userStoryId", "project epic")
      .lean();

    // Projects available to this user (from sprints they are in)
    const myProjectIds = [...new Set(mySprints.map((s) => String(s.project?._id || s.project)))];
    const availableProjects = await Project.find({ _id: { $in: myProjectIds } }).select("name").lean();

    const totals = {
      myTasks: tasks.length,
      estHours: tasks.reduce((a, b) => a + (b.estimatedHours || 0), 0),
      actHours: tasks.reduce((a, b) => a + (b.actualHours || 0), 0),
    };

    const statusCount = { "To Do": 0, "In Progress": 0, Paused: 0, Blocked: 0, Done: 0 };
    tasks.forEach((t) => {
      if (statusCount[t.status] !== undefined) statusCount[t.status]++;
    });

    // Throughput (mine) by day
    const daysMap = new Map();
    for (let i = windowDays - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      daysMap.set(d.toISOString().slice(0, 10), 0);
    }
    for (const t of tasks) {
      if (t.completedAt && t.completedAt >= cutoff) {
        const key = new Date(t.completedAt).toISOString().slice(0, 10);
        if (daysMap.has(key)) daysMap.set(key, daysMap.get(key) + 1);
      }
    }
    const throughputByDay = Array.from(daysMap.entries()).map(([date, count]) => ({ date, count }));

    // Avg cycle time
    let cycleSum = 0;
    let cycleCount = 0;
    for (const t of tasks) {
      if (t.completedAt) {
        const started = t.startedAt || (t.statusChangeLog || []).find((x) => x.status === "In Progress")?.changedAt;
        if (started) {
          cycleSum += (new Date(t.completedAt) - new Date(started)) / 36e5;
          cycleCount++;
        }
      }
    }
    const avgCycleHours = cycleCount ? +(cycleSum / cycleCount).toFixed(2) : null;

    // By project / by sprint
    const byProject = {};
    const bySprint = {};
    for (const t of tasks) {
      const pid =
        (t.userStoryId && (t.userStoryId.project?._id || t.userStoryId.project)) ||
        (t.sprintId && (t.sprintId.project?._id || t.sprintId.project)) ||
        null;
      const sid = t.sprintId?._id || t.sprintId;

      if (pid) {
        byProject[pid] ||= { projectId: String(pid), name: null, counts: { todo: 0, inProgress: 0, paused: 0, blocked: 0, done: 0 } };
        const rec = byProject[pid];
        if (t.status === "To Do") rec.counts.todo++;
        else if (t.status === "In Progress") rec.counts.inProgress++;
        else if (t.status === "Paused") rec.counts.paused++;
        else if (t.status === "Blocked") rec.counts.blocked++;
        else if (t.status === "Done") rec.counts.done++;
      }

      if (sid) {
        bySprint[sid] ||= { sprintId: String(sid), name: null, counts: { todo: 0, inProgress: 0, paused: 0, blocked: 0, done: 0 } };
        const rec2 = bySprint[sid];
        if (t.status === "To Do") rec2.counts.todo++;
        else if (t.status === "In Progress") rec2.counts.inProgress++;
        else if (t.status === "Paused") rec2.counts.paused++;
        else if (t.status === "Blocked") rec2.counts.blocked++;
        else if (t.status === "Done") rec2.counts.done++;
      }
    }

    // Label project/sprint names
    for (const s of mySprints) {
        const sid = String(s._id);
        if (bySprint[sid]) bySprint[sid].name = s.name;
        const pid = String(s.project?._id || s.project);
        if (byProject[pid] && !byProject[pid].name) byProject[pid].name = s.project?.name || null;
    }

    const missingProjIds = Object.values(byProject)
        .filter(p => !p.name)
        .map(p => p.projectId);

      if (missingProjIds.length) {
        const projDocs = await Project.find({ _id: { $in: missingProjIds } }).select("name").lean();
        const nameMap = new Map(projDocs.map(d => [String(d._id), d.name]));
        for (const p of Object.values(byProject)) {
          if (!p.name) p.name = nameMap.get(p.projectId) || "(Unknown Project)";
        }
      }

    // WIP risks for the user's tasks
    const wipRisk = tasks
      .filter((t) => ["In Progress", "Paused", "Blocked"].includes(t.status))
      .map((t) => {
        const last = (t.statusChangeLog || []).slice().reverse().find((x) => x.status === t.status);
        const days = last?.changedAt ? (now - new Date(last.changedAt)) / 86400000 : null;
        return {
          taskId: String(t._id),
          title: t.title,
          status: t.status,
          daysInStatus: days ? +days.toFixed(1) : null,
          sprint: t.sprintId?.name || "",
        };
      })
      .sort((a, b) => (b.daysInStatus || 0) - (a.daysInStatus || 0));

    res.json({
      meta: { windowDays, now, projectId: projectId ? String(projectId) : null },
      availableProjects, // limited to user's projects
      totals,
      statusCount,
      avgCycleHours,
      throughputByDay,
      byProject: Object.values(byProject),
      bySprint: Object.values(bySprint),
      wipRisk,
    });
  } catch (err) {
    console.error("/dashboard/mine error", err);
    res.status(500).json({ message: "Failed to build personal dashboard", error: err.message });
  }
};



