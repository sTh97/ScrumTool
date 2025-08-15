const mongoose = require("mongoose");
const OtherTask = require("../models/OtherTask");
const OtherTaskType = require("../models/OtherTaskType");
const { buildScopeFilter, isRole } = require("../middlewares/otherTasks.scope");
const { sumSessionsHours, ensureNoOtherActive } = require("../services/otherTasks.service");

function canAssignOthers(req) {
  return isRole(req, ["Admin", "System Administrator", "Project Manager", "Senior Project Supervisor"]);
}

function isAssignee(req, task) {
  return task.assignee?.toString() === req.user.id.toString();
}

// Create
exports.create = async (req, res) => {
  try {
    const {
      project = null,
      description,
      typeId,
      createdDate,
      dueDate,
      durationPlannedHrs = 0,
      assignee, // optional; only for Admin/PM/SPS
      notes = ""
    } = req.body;

    if (!description || !typeId) {
      return res.status(400).json({ message: "description and typeId are required" });
    }

    const type = await OtherTaskType.findById(typeId);
    if (!type || !type.isActive) return res.status(400).json({ message: "Invalid typeId" });

    let finalAssignee = req.user.id;
    let assignedBy = null;
    if (assignee && assignee !== req.user.id) {
      if (!canAssignOthers(req)) return res.status(403).json({ message: "You cannot assign to others" });
      finalAssignee = assignee;
      assignedBy = req.user.id;
    }

    const task = await OtherTask.create({
      project: project || null,
      description,
      typeId,
      createdDate: createdDate ? new Date(createdDate) : new Date(),
      dueDate: dueDate ? new Date(dueDate) : undefined,
      durationPlannedHrs: Number(durationPlannedHrs) || 0,
      status: "To Do",
      assignee: finalAssignee,
      assignedBy,
      notes,
      createdBy: req.user.id,
    });

    // const populated = await task
    //   .populate("project", "name")
    //   .populate("typeId", "name")
    //   .populate("assignee", "name email");

    // res.status(201).json(populated);
    await task.populate([
      { path: "project", select: "name" },
      { path: "typeId", select: "name" },
      { path: "assignee", select: "name email" },
    ]);
    return res.status(201).json(task);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

// List with RBAC scoping, filters, pagination
exports.list = async (req, res) => {
  try {
    const scope = buildScopeFilter(req);
    const {
      status, assignee, project, typeId, dateFrom, dateTo, q,
      page = 1, limit = 20, sort = "createdDate", dir = "desc",
    } = req.query;

    const filter = { ...scope };
    if (status) filter.status = status;
    if (assignee && mongoose.isValidObjectId(assignee)) filter.assignee = assignee;
    if (project && mongoose.isValidObjectId(project)) filter.project = project;
    if (typeId && mongoose.isValidObjectId(typeId)) filter.typeId = typeId;
    if (dateFrom || dateTo) {
      filter.createdDate = {};
      if (dateFrom) filter.createdDate.$gte = new Date(dateFrom);
      if (dateTo) filter.createdDate.$lte = new Date(dateTo);
    }
    if (q) {
      filter.description = { $regex: q, $options: "i" };
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const lim = Math.max(1, Math.min(parseInt(limit, 10), 100));
    const sortDir = dir === "asc" ? 1 : -1;

    const [items, total] = await Promise.all([
      OtherTask.find(filter)
        .populate("project", "name")
        .populate("typeId", "name")
        .populate("assignee", "name email")
        .sort({ [sort]: sortDir })
        .skip((pageNum - 1) * lim)
        .limit(lim)
        .lean(),
      OtherTask.countDocuments(filter),
    ]);

    res.json({
      items,
      pagination: { page: pageNum, limit: lim, total, pages: Math.ceil(total / lim) }
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Get by id (scoped)
exports.getOne = async (req, res) => {
  try {
    const scope = buildScopeFilter(req);
    const task = await OtherTask.findOne({ _id: req.params.id, ...scope })
      .populate("project", "name")
      .populate("typeId", "name")
      .populate("assignee", "name email")
      .lean();
    if (!task) return res.status(404).json({ message: "Not found" });
    res.json(task);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

// Update (assignee only; not after Done)
exports.update = async (req, res) => {
  try {
    const task = await OtherTask.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Not found" });

    // Scoped visibility
    const scope = buildScopeFilter(req);
    const visible = await OtherTask.findOne({ _id: task._id, ...scope }).select("_id").lean();
    if (!visible) return res.status(403).json({ message: "Forbidden" });

    if (!isAssignee(req, task)) return res.status(403).json({ message: "Only assignee can edit" });
    if (task.status === "Done") return res.status(400).json({ message: "Cannot edit after Done" });

    const { description, typeId, project, dueDate, durationPlannedHrs, notes } = req.body;
    if (typeof description === "string") task.description = description.trim();
    if (typeId) {
      const type = await OtherTaskType.findById(typeId);
      if (!type || !type.isActive) return res.status(400).json({ message: "Invalid typeId" });
      task.typeId = typeId;
    }
    if (project !== undefined) task.project = project || null;
    if (dueDate !== undefined) task.dueDate = dueDate ? new Date(dueDate) : undefined;
    if (durationPlannedHrs !== undefined) task.durationPlannedHrs = Number(durationPlannedHrs) || 0;
    if (typeof notes === "string") task.notes = notes;

    await task.save();
    // const populated = await task.populate("project", "name").populate("typeId", "name").populate("assignee", "name email");
    // res.json(populated);
    await task.populate([
      { path: "project", select: "name" },
      { path: "typeId", select: "name" },
      { path: "assignee", select: "name email" },
    ]);
    return res.json(task);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

// Status transitions (atomic)
exports.start = async (req, res) => {
  try {
    const task = await OtherTask.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Not found" });
    if (!isAssignee(req, task)) return res.status(403).json({ message: "Only assignee can start" });

    await ensureNoOtherActive(req.user.id, task._id);

    if (!["To Do", "Paused"].includes(task.status)) {
      return res.status(400).json({ message: `Cannot start from ${task.status}` });
    }
    const last = task.workSessions[task.workSessions.length - 1];
    if (last && !last.to) return res.status(400).json({ message: "A session is already open" });

    task.workSessions.push({ from: new Date() });
    task.statusChangeLog.push({ fromStatus: task.status, toStatus: "In Progress", changedBy: req.user.id, changedAt: new Date() });
    task.status = "In Progress";
    await task.save();
    res.json(task);
  } catch (e) {
    const code = e.code === "ACTIVE_EXISTS" ? 409 : 400;
    res.status(code).json({ message: e.message });
  }
};

exports.pause = async (req, res) => {
  try {
    const task = await OtherTask.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Not found" });
    if (!isAssignee(req, task)) return res.status(403).json({ message: "Only assignee can pause" });

    if (task.status !== "In Progress") return res.status(400).json({ message: "Task is not In Progress" });
    const last = task.workSessions[task.workSessions.length - 1];
    if (!last || last.to) return res.status(400).json({ message: "No open session to close" });

    last.to = new Date();
    task.statusChangeLog.push({ fromStatus: "In Progress", toStatus: "Paused", changedBy: req.user.id, changedAt: new Date() });
    task.status = "Paused";
    await task.save();
    res.json(task);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

exports.resume = async (req, res) => {
  try {
    const task = await OtherTask.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Not found" });
    if (!isAssignee(req, task)) return res.status(403).json({ message: "Only assignee can resume" });

    await ensureNoOtherActive(req.user.id, task._id);

    if (task.status !== "Paused") return res.status(400).json({ message: `Cannot resume from ${task.status}` });
    const last = task.workSessions[task.workSessions.length - 1];
    if (last && !last.to) return res.status(400).json({ message: "A session is already open" });

    task.workSessions.push({ from: new Date() });
    task.statusChangeLog.push({ fromStatus: "Paused", toStatus: "In Progress", changedBy: req.user.id, changedAt: new Date() });
    task.status = "In Progress";
    await task.save();
    res.json(task);
  } catch (e) {
    const code = e.code === "ACTIVE_EXISTS" ? 409 : 400;
    res.status(code).json({ message: e.message });
  }
};

exports.done = async (req, res) => {
  try {
    const task = await OtherTask.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Not found" });
    if (!isAssignee(req, task)) return res.status(403).json({ message: "Only assignee can complete" });

    if (task.status === "In Progress") {
      const last = task.workSessions[task.workSessions.length - 1];
      if (last && !last.to) last.to = new Date();
    }
    task.statusChangeLog.push({ fromStatus: task.status, toStatus: "Done", changedBy: req.user.id, changedAt: new Date() });
    task.status = "Done";
    task.completedAt = new Date();
    task.actualHours = sumSessionsHours(task.workSessions);
    await task.save();
    res.json(task);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};
