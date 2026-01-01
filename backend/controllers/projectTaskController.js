// controllers/projectTaskController.js
const ProjectTask = require('../models/ProjectTask');
const TaskStatusHistory = require('../models/TaskStatusHistory');
const ProjectPlanItem = require('../models/ProjectPlanItem');
const ProjectFile = require('../models/ProjectFile');
const ProjectCharter = require('../models/ProjectCharter');
const CharterSignature = require('../models/CharterSignature');
const ProjectMember = require('../models/ProjectMember');
const ProjectDependency = require('../models/ProjectDependency');

// ---- helpers ----
function sameId(a, b) {
  if (!a || !b) return false;
  return String(a) === String(b);
}

async function isCharterApproved(projectId) {
  const charter = await ProjectCharter.findOne({ projectId }).lean();
  if (!charter) return false;
  const sigs = await CharterSignature.find({ charterId: charter._id }).lean();
  const total = (charter.approvers || []).length;
  const approved =
    sigs.filter((s) => String(s.status).toLowerCase() === 'approved').length;
  return total > 0 && approved === total;
}

async function isProjectLeadOrManager(projectId, userId) {
  if (!userId) return false;
  const m = await ProjectMember.findOne({ projectId, userId }).lean();
  return !!m && ['Lead', 'Manager', 'Project Manager'].includes(m.role);
}

function isAdminLike(user) {
  if (!user) return false;
  const roles = user.roles || user.role || [];
  const arr = Array.isArray(roles) ? roles : [roles];
  return arr.some((r) =>
    ['Admin', 'System Administrator', 'Project Manager'].includes(r)
  );
}

// ---- controller methods ----

// GET /project/:projectId
exports.listByProject = async (req, res) => {
  try {
    const tasks = await ProjectTask.find({ projectId: req.params.projectId })
      .sort({ createdAt: -1 })
      .populate('assigneeId', 'name fullName email')
      .populate('createdBy', 'name fullName email')
      .lean();
    res.json(tasks);
  } catch (err) {
    console.error('listByProject error', err);
    res.status(500).json({ message: 'Failed to load project tasks' });
  }
};

// POST /
exports.createTask = async (req, res) => {
  try {
    const {
      projectId,
      planItemId,
      title,
      description = '',
      assigneeId,
      priority = 'Medium',
      startDate = null,
      dueDate = null,
      estimateHrs = 0,
      dependencies = [],
    } = req.body;

    if (!projectId) {
      return res.status(400).json({ message: 'projectId is required' });
    }
    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'title is required' });
    }

    // gate tasks until charter is fully approved
    if (!(await isCharterApproved(projectId))) {
      return res.status(403).json({
        message: 'Project charter must be fully approved before adding tasks.',
      });
    }

    // validate optional plan item
    if (planItemId) {
      const ok = await ProjectPlanItem.exists({ _id: planItemId, projectId });
      if (!ok) {
        return res.status(400).json({ message: 'Invalid planItemId' });
      }
    }

    const task = await ProjectTask.create({
      projectId,
      planItemId: planItemId || undefined,
      title: title.trim(),
      description,
      assigneeId: assigneeId || undefined,
      priority,
      startDate,
      dueDate,
      estimateHrs,
      dependencies,
      status: 'New',
      createdBy: req.user?._id,
    });

    res.status(201).json(task);
  } catch (err) {
    console.error('createTask error', err);
    res.status(500).json({ message: 'Failed to create task' });
  }
};

// GET /:taskId
exports.getTask = async (req, res) => {
  try {
    const task = await ProjectTask.findById(req.params.taskId)
      .populate('assigneeId', 'name fullName email')
      .populate('createdBy', 'name fullName email');
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (err) {
    console.error('getTask error', err);
    res.status(500).json({ message: 'Failed to load task' });
  }
};

// PATCH /:taskId  (only creator can edit core fields)
exports.updateTask = async (req, res) => {
  try {
    const task = await ProjectTask.findById(req.params.taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (!sameId(task.createdBy, req.user?._id)) {
      return res.status(403).json({
        message: 'Only the user who created the task can update it.',
      });
    }

    const fields = [
      'title',
      'description',
      'assigneeId',
      'priority',
      'startDate',
      'dueDate',
      'estimateHrs',
      'dependencies',
      'planItemId',
    ];

    const update = {};
    fields.forEach((f) => {
      if (req.body[f] !== undefined) update[f] = req.body[f];
    });

    // validate updated planItemId
    if (update.planItemId) {
      const ok = await ProjectPlanItem.exists({
        _id: update.planItemId,
        projectId: task.projectId,
      });
      if (!ok) {
        return res.status(400).json({ message: 'Invalid planItemId' });
      }
    }

    Object.assign(task, update);
    await task.save();

    res.json(task);
  } catch (err) {
    console.error('updateTask error', err);
    res.status(500).json({ message: 'Failed to update task' });
  }
};

// DELETE /:taskId (only creator can delete)
exports.deleteTask = async (req, res) => {
  try {
    const task = await ProjectTask.findById(req.params.taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (!sameId(task.createdBy, req.user?._id)) {
      return res.status(403).json({
        message: 'Only the user who created the task can delete it.',
      });
    }

    await ProjectFile.deleteMany({ taskId: task._id });
    await ProjectDependency.deleteMany({ taskId: task._id });
    await TaskStatusHistory.deleteMany({ taskId: task._id });

    await task.deleteOne();

    res.json({ ok: true });
  } catch (err) {
    console.error('deleteTask error', err);
    res.status(500).json({ message: 'Failed to delete task' });
  }
};

// GET /:taskId/history
exports.getTaskHistory = async (req, res) => {
  try {
    const history = await TaskStatusHistory.find({ taskId: req.params.taskId })
      .sort({ changedAt: -1 })
      .populate('changedBy', 'name fullName email')
      .lean();
    res.json(history);
  } catch (err) {
    console.error('getTaskHistory error', err);
    res.status(500).json({ message: 'Failed to load status history' });
  }
};

// PATCH /:taskId/status
exports.changeTaskStatus = async (req, res) => {
  try {
    const { to, note = '' } = req.body;
    const user = req.user;

    const task = await ProjectTask.findById(req.params.taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const map = {
      New: ['In Progress'],
      'In Progress': ['Completed', 'Hold'],
      Hold: ['In Progress'],
      Completed: ['Re Opened'],
      'Re Opened': ['In Progress', 'Completed'],
    };

    if (!map[task.status] || !map[task.status].includes(to)) {
      return res.status(400).json({ message: 'Invalid status transition' });
    }

    const isAssignee = sameId(task.assigneeId, user?._id);
    const isPMOrAdmin =
      (await isProjectLeadOrManager(task.projectId, user?._id)) ||
      isAdminLike(user);

    // normal transitions (not Re Opened) → only assignee
    if (to !== 'Re Opened' && !isAssignee) {
      return res.status(403).json({
        message: 'Only the assignee can change this task status.',
      });
    }

    // Completed → Re Opened → assignee or PM/Admin; PM/Admin must provide note
    if (to === 'Re Opened') {
      if (!isAssignee && !isPMOrAdmin) {
        return res.status(403).json({
          message:
            'Only the assignee or project manager can re-open this task.',
        });
      }
      if (!isAssignee && !note.trim()) {
        return res.status(400).json({
          message:
            'Please provide a note explaining why the task is being re-opened.',
        });
      }
    }

    await TaskStatusHistory.create({
      taskId: task._id,
      from: task.status,
      to,
      note,
      changedBy: user?._id,
      changedAt: new Date(),
    });

    task.status = to;
    task.updatedAt = new Date();
    await task.save();

    res.json({ ok: true, task });
  } catch (err) {
    console.error('changeTaskStatus error', err);
    res.status(500).json({ message: 'Failed to change task status' });
  }
};

// POST /:taskId/files
exports.attachFiles = async (req, res) => {
  try {
    const task = await ProjectTask.findById(req.params.taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const created = await ProjectFile.insertMany(
      (req.files || []).map((f) => ({
        projectId: task.projectId,
        taskId: task._id,
        uploadedBy: req.user?._id,
        filename: f.originalname,
        path: f.path,
        size: f.size,
      }))
    );
    res.status(201).json(created);
  } catch (err) {
    console.error('attachFiles error', err);
    res.status(500).json({ message: 'Failed to attach files' });
  }
};
