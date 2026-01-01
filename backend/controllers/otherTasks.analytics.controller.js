const mongoose = require("mongoose");
const OtherTask = require("../models/OtherTask");
const OtherTaskType = require("../models/OtherTaskType");
const { buildScopeFilter } = require("../middlewares/otherTasks.scope");

// Common filter builder from query
function makeFilter(req) {
  const scope = buildScopeFilter(req);
  const { status, assignee, project, typeId, dateFrom, dateTo, q } = req.query;
  const filter = { ...scope };

  if (status) filter.status = status;
  if (assignee && mongoose.isValidObjectId(assignee)) filter.assignee = new mongoose.Types.ObjectId(assignee);
  if (project && mongoose.isValidObjectId(project)) filter.project = new mongoose.Types.ObjectId(project);
  if (typeId && mongoose.isValidObjectId(typeId)) filter.typeId = new mongoose.Types.ObjectId(typeId);
  if (dateFrom || dateTo) {
    filter.createdDate = {};
    if (dateFrom) filter.createdDate.$gte = new Date(dateFrom);
    if (dateTo) filter.createdDate.$lte = new Date(dateTo);
  }
  if (q) filter.description = { $regex: q, $options: "i" };
  return filter;
}

// Helpers
const ms = n => n; // we work in ms internally
const clip = (from, to, start, end) => {
  const a = Math.max(from.getTime(), start.getTime());
  const b = Math.min((to ? to : new Date()).getTime(), end.getTime());
  return Math.max(0, b - a);
};

// 1) SUMMARY: KPIs + status donut + type treemap seeds
exports.summary = async (req, res) => {
  const filter = makeFilter(req);

  const pipeline = [
    { $match: filter },
    {
      $facet: {
        kpis: [
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              todo: { $sum: { $cond: [{ $eq: ["$status", "To Do"] }, 1, 0] } },
              inprog: { $sum: { $cond: [{ $eq: ["$status", "In Progress"] }, 1, 0] } },
              paused: { $sum: { $cond: [{ $eq: ["$status", "Paused"] }, 1, 0] } },
              done: { $sum: { $cond: [{ $eq: ["$status", "Done"] }, 1, 0] } },
              plannedHrs: { $sum: "$durationPlannedHrs" },
              // “actualHours” is set on Done; for in-flight we’ll recompute client-side if needed
              actualHrsDone: { $sum: "$actualHours" },
              avgLeadMs: {
                $avg: {
                  $cond: [
                    { $and: ["$completedAt", "$createdDate"] },
                    { $subtract: ["$completedAt", "$createdDate"] },
                    null
                  ]
                }
              }
            }
          }
        ],
        types: [
          {
            $group: {
              _id: "$typeId",
              count: { $sum: 1 },
              actualHrsDone: { $sum: "$actualHours" },
              plannedHrs: { $sum: "$durationPlannedHrs" }
            }
          },
          { $lookup: { from: "othertasktypes", localField: "_id", foreignField: "_id", as: "type" } },
          { $unwind: { path: "$type", preserveNullAndEmptyArrays: true } },
          { $project: { _id: 0, typeId: "$_id", typeName: "$type.name", count: 1, actualHrsDone: 1, plannedHrs: 1 } }
        ]
      }
    }
  ];

  const [out] = await OtherTask.aggregate(pipeline);
  res.json(out);
};

// 2) TIMESERIES: completions per day/week
exports.timeseries = async (req, res) => {
  const filter = makeFilter(req);
  const { bucket = "day" } = req.query;
  const dateFormat = bucket === "week" ? "%G-%V" : "%Y-%m-%d";

  const pipe = [
    { $match: { ...filter, completedAt: { $ne: null } } },
    {
      $group: {
        _id: { $dateToString: { date: "$completedAt", format: dateFormat } },
        done: { $sum: 1 }
      }
    },
    { $sort: { "_id": 1 } },
    { $project: { label: "$_id", done: 1, _id: 0 } }
  ];
  const rows = await OtherTask.aggregate(pipe);
  res.json({ rows, bucket });
};

// 3) ESTIMATION: over/ok/under counts (server mirrors your estimationBadge logic)
exports.estimation = async (req, res) => {
  const filter = makeFilter(req);
  const pipe = [
    { $match: { ...filter, durationPlannedHrs: { $gt: 0 } } },
    {
      $project: {
        ratio: {
          $cond: [
            { $gt: ["$durationPlannedHrs", 0] },
            { $divide: ["$actualHours", "$durationPlannedHrs"] },
            null
          ]
        }
      }
    },
    {
      $group: {
        _id: {
          $switch: {
            branches: [
              { case: { $lte: ["$ratio", 0.4] }, then: "over" },
              { case: { $lte: ["$ratio", 1.0] }, then: "ok" }
            ],
            default: "under"
          }
        },
        count: { $sum: 1 }
      }
    }
  ];
  const rows = await OtherTask.aggregate(pipe);
  res.json({ rows });
};

// 4) HEATMAP: weekday x hour from workSessions
exports.heatmap = async (req, res) => {
  const filter = makeFilter(req);
  const { dateFrom, dateTo } = req.query;
  const start = dateFrom ? new Date(dateFrom) : new Date("1970-01-01");
  const end = dateTo ? new Date(dateTo) : new Date();

  // Pull sessions raw, do hour-binning in JS (simpler & fast enough with paging by date)
  const tasks = await OtherTask.find(filter, { workSessions: 1 }).lean();

  const grid = Array.from({ length: 7 }, () => Array(24).fill(0));
  for (const t of tasks) {
    for (const s of (t.workSessions || [])) {
      if (!s.from) continue;
      const from = new Date(s.from);
      const to = s.to ? new Date(s.to) : new Date();
      let f = new Date(Math.max(from, start));
      const stopAt = new Date(Math.min(to, end));
      if (f > stopAt) continue;
      // step hour by hour
      while (f <= stopAt) {
        const hourStart = new Date(f);
        hourStart.setMinutes(0, 0, 0);
        const hourEnd = new Date(hourStart); hourEnd.setHours(hourEnd.getHours() + 1);
        const seg = clip(from, to, hourStart, hourEnd);
        const dow = hourStart.getDay();  // 0..6
        const hod = hourStart.getHours(); // 0..23
        grid[dow][hod] += seg / (1000 * 60 * 60); // hours
        f = hourEnd;
      }
    }
  }
  res.json({ grid /* 7 x 24 hours */ });
};

// 5) USERS COMPARISON: planned vs actual + interruption stats
exports.usersComparison = async (req, res) => {
  const filter = makeFilter(req);

  const rows = await OtherTask.aggregate([
    { $match: filter },
    {
      $project: {
        assignee: 1,
        durationPlannedHrs: 1,
        actualHours: 1,
        sessions: { $size: "$workSessions" },
        isDone: { $eq: ["$status", "Done"] },
        leadMs: {
          $cond: [
            { $and: ["$completedAt", "$createdDate"] },
            { $subtract: ["$completedAt", "$createdDate"] },
            null
          ]
        }
      }
    },
    {
      $group: {
        _id: "$assignee",
        planned: { $sum: "$durationPlannedHrs" },
        actual: { $sum: "$actualHours" },
        tasks: { $sum: 1 },
        sessions: { $sum: "$sessions" },
        done: { $sum: { $cond: ["$isDone", 1, 0] } },
        avgLeadMs: { $avg: "$leadMs" },
        zeroPlanned: { $sum: { $cond: [{ $lte: ["$durationPlannedHrs", 0] }, 1, 0] } }
      }
    },
    {
      $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" }
    },
    { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
    { $project: { userId: "$_id", name: "$user.name", email: "$user.email", planned: 1, actual: 1, tasks: 1, sessions: 1, done: 1, avgLeadMs: 1, zeroPlanned: 1, _id: 0 } },
    { $sort: { name: 1 } }
  ]);

  res.json({ rows });
};

// 6) DISTRIBUTIONS: session length histogram, over-due, status, types
exports.distributions = async (req, res) => {
  const filter = makeFilter(req);
  const tasks = await OtherTask.find(filter, { workSessions: 1, status: 1, dueDate: 1, completedAt: 1, typeId: 1 }).lean();

  // Build session length histogram on server (bins: 0–10,10–20,...,120+ mins)
  const bins = Array.from({ length: 13 }, () => 0);
  const overdue = { open: 0, closedLate: 0 };
  const now = new Date();

  for (const t of tasks) {
    // overdue
    if (t.dueDate) {
      if (t.status !== "Done" && t.dueDate < now) overdue.open++;
      if (t.status === "Done" && t.completedAt && t.completedAt > t.dueDate) overdue.closedLate++;
    }
    // histogram
    for (const s of (t.workSessions || [])) {
      if (!s.from) continue;
      const end = s.to ? new Date(s.to) : now;
      const mins = Math.max(0, (end - new Date(s.from)) / 60000);
      const idx = Math.min(12, Math.floor(mins / 10)); // 0-10..120+
      bins[idx]++;
    }
  }

  res.json({ histogram10MinBins: bins, overdue });
};
