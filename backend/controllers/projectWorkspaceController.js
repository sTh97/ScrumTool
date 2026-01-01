// // controllers/projectWorkspaceController.js
// const fs = require('fs');
// const path = require('path');
// const nodemailer = require('nodemailer');

// const Project = require('../models/Project');
// const User = require('../models/User');
// const ProjectMember = require('../models/ProjectMember');
// const ProjectNote = require('../models/ProjectNote');
// const ProjectFile = require('../models/ProjectFile');
// const ProjectChatMessage = require('../models/ProjectChatMessage');
// const MessageReadReceipt = require('../models/MessageReadReceipt');
// const ProjectPlanItem = require('../models/ProjectPlanItem');
// const ProjectTask = require('../models/ProjectTask');
// const ProjectDependency = require('../models/ProjectDependency');
// const ProjectCharter = require('../models/ProjectCharter');
// const CharterSignature = require('../models/CharterSignature');

// // ---------- email helper ----------

// let transport = null;

// function getTransport() {
//   if (transport) return transport;

//   if (
//     !process.env.SMTP_HOST ||
//     !process.env.SMTP_USER ||
//     !process.env.SMTP_PASS
//   ) {
//     console.warn(
//       '[workspace] SMTP_* env vars not set, email notifications disabled.'
//     );
//     return null;
//   }

//   transport = nodemailer.createTransport({
//     host: process.env.SMTP_HOST,
//     port: Number(process.env.SMTP_PORT || 587),
//     secure: false,
//     auth: {
//       user: process.env.SMTP_USER,
//       pass: process.env.SMTP_PASS,
//     },
//   });

//   return transport;
// }

// async function sendEmail(to, subject, html) {
//   try {
//     const t = getTransport();
//     const list = Array.isArray(to) ? to : [to];
//     const filtered = list.filter(Boolean);
//     if (!t || !filtered.length) return;
//     await t.sendMail({
//       from: process.env.SMTP_FROM || process.env.SMTP_USER,
//       to: filtered.join(','),
//       subject,
//       html,
//     });
//   } catch (err) {
//     console.error('sendEmail error (ignored)', err.message || err);
//   }
// }

// // ---------- helpers ----------

// function sameId(a, b) {
//   if (!a || !b) return false;
//   return String(a) === String(b);
// }

// async function isCharterApproved(projectId) {
//   const charter = await ProjectCharter.findOne({ projectId }).lean();
//   if (!charter) return false;
//   const sigs = await CharterSignature.find({ charterId: charter._id }).lean();
//   const total = (charter.approvers || []).length;
//   const approved =
//     sigs.filter((s) => String(s.status).toLowerCase() === 'approved').length;
//   return total > 0 && approved === total;
// }

// async function canManagePlan(projectId, user) {
//   if (!user) return false;

//   // global roles
//   const roles = user.roles || user.role || [];
//   const arr = Array.isArray(roles) ? roles : [roles];
//   if (
//     arr.some((r) =>
//       ['Admin', 'System Administrator', 'Project Manager'].includes(r)
//     )
//   ) {
//     return true;
//   }

//   // project-level roles
//   const m = await ProjectMember.findOne({ projectId, userId: user._id }).lean();
//   return !!m && ['Lead', 'Manager', 'Project Manager'].includes(m.role);
// }

// // ---------- Members ----------

// // GET /projects/:id/members
// exports.getMembers = async (req, res) => {
//   try {
//     const members = await ProjectMember.find({ projectId: req.params.id })
//       .populate('userId', 'name fullName email')
//       .lean();
//     res.json(members);
//   } catch (err) {
//     console.error('getMembers error', err);
//     res.status(500).json({ message: 'Failed to load project members' });
//   }
// };

// // POST /projects/:id/members
// // exports.addMembers = async (req, res) => {
// //   try {
// //     const projectId = req.params.id;
// //     const { userIds = [], role = 'Member' } = req.body;

// //     if (!Array.isArray(userIds) || !userIds.length) {
// //       return res.status(400).json({ message: 'userIds are required' });
// //     }

// //     const existing = await ProjectMember.find({ projectId }).lean();
// //     const existingSet = new Set(
// //       existing.map((m) => String(m.userId))
// //     );

// //     const docs = userIds
// //       .filter((id) => !existingSet.has(String(id)))
// //       .map((userId) => ({
// //         projectId,
// //         userId,
// //         role,
// //         addedBy: req.user._id,
// //         addedAt: now,
// //       }));

// //     if (docs.length) {
// //       await ProjectMember.insertMany(docs);
// //     }

// //     const members = await ProjectMember.find({ projectId })
// //       .populate('userId', 'name fullName email')
// //       .lean();

// //     res.status(201).json(members);
// //   } catch (err) {
// //     console.error('addMembers error', err);
// //     res.status(500).json({ message: 'Failed to add members' });
// //   }
// // };

// exports.addMembers = async (req, res) => {
//   try {
//     const projectId = req.params.id;
//     const { userIds = [], role = 'Member' } = req.body;

//     if (!Array.isArray(userIds) || !userIds.length) {
//       return res.status(400).json({ message: 'userIds are required' });
//     }

//     // Make sure we know who is adding the members
//     const currentUserId = req.user && req.user._id;
//     if (!currentUserId) {
//       return res.status(401).json({ message: 'Authentication required' });
//     }

//     const existing = await ProjectMember.find({ projectId }).lean();
//     const existingSet = new Set(existing.map((m) => String(m.userId)));

//     const now = new Date(); // ✅ define 'now'

//     const docs = userIds
//       .filter((id) => !existingSet.has(String(id)))
//       .map((userId) => ({
//         projectId,
//         userId,
//         role,              // 'Owner' / 'PM' / 'Member' according to your enum
//         addedBy: currentUserId,
//         addedAt: now,
//       }));

//     if (docs.length) {
//       await ProjectMember.insertMany(docs);
//     }

//     const members = await ProjectMember.find({ projectId })
//       .populate('userId', 'name fullName email')
//       .lean();

//     res.status(201).json(members);
//   } catch (err) {
//     console.error('addMembers error', err);
//     res.status(500).json({ message: 'Failed to add members' });
//   }
// };

// // PUT /projects/:id/members/:memberId
// exports.updateMember = async (req, res) => {
//   try {
//     const { role } = req.body;
//     await ProjectMember.findOneAndUpdate(
//       { _id: req.params.memberId, projectId: req.params.id },
//       { role },
//       { new: true }
//     );

//     const members = await ProjectMember.find({ projectId: req.params.id })
//       .populate('userId', 'name fullName email')
//       .lean();
//     res.json(members);
//   } catch (err) {
//     console.error('updateMember error', err);
//     res.status(500).json({ message: 'Failed to update member' });
//   }
// };

// // DELETE /projects/:id/members/:memberId
// exports.removeMember = async (req, res) => {
//   try {
//     await ProjectMember.deleteOne({
//       _id: req.params.memberId,
//       projectId: req.params.id,
//     });
//     const members = await ProjectMember.find({ projectId: req.params.id })
//       .populate('userId', 'name fullName email')
//       .lean();
//     res.json(members);
//   } catch (err) {
//     console.error('removeMember error', err);
//     res.status(500).json({ message: 'Failed to remove member' });
//   }
// };

// // ---------- Charter ----------

// // GET /projects/:id/charter
// exports.getCharter = async (req, res) => {
//   try {
//     const projectId = req.params.id;
//     const charter = await ProjectCharter.findOne({ projectId }).lean();
//     if (!charter) {
//       return res.json(null);
//     }
//     const signatures = await CharterSignature.find({
//       charterId: charter._id,
//     })
//       .populate('userId', 'name fullName email')
//       .lean();

//     res.json({ charter, signatures });
//   } catch (err) {
//     console.error('getCharter error', err);
//     res.status(500).json({ message: 'Failed to load charter' });
//   }
// };

// // POST /projects/:id/charter
// exports.upsertCharter = async (req, res) => {
//   try {
//     const projectId = req.params.id;
//     const {
//       purpose = '',
//       scope = '',
//       objectives = '',
//       risks = '',
//       assumptions = '',
//       approvers = [],
//     } = req.body;

//     const payload = {
//       projectId,
//       purpose,
//       scope,
//       objectives,
//       risks,
//       assumptions,
//       approvers,
//     };

//     const charter = await ProjectCharter.findOneAndUpdate(
//       { projectId },
//       payload,
//       { new: true, upsert: true }
//     );

//     res.status(201).json(charter);
//   } catch (err) {
//     console.error('upsertCharter error', err);
//     res.status(500).json({ message: 'Failed to save charter' });
//   }
// };

// // POST /charter/:charterId/approvers
// exports.updateCharterApprovers = async (req, res) => {
//   try {
//     const { approvers = [] } = req.body;
//     const charter = await ProjectCharter.findByIdAndUpdate(
//       req.params.charterId,
//       { approvers },
//       { new: true }
//     );
//     if (!charter) {
//       return res.status(404).json({ message: 'Charter not found' });
//     }
//     res.json(charter);
//   } catch (err) {
//     console.error('updateCharterApprovers error', err);
//     res.status(500).json({ message: 'Failed to update approvers' });
//   }
// };

// // POST /charter/:charterId/sign
// // exports.signCharter = async (req, res) => {
// //   try {
// //     const { status, remarks = '' } = req.body;
// //     const charterId = req.params.charterId;
// //     const userId = req.user?._id;

// //     if (!userId) {
// //       return res.status(401).json({ message: 'Authentication required' });
// //     }

// //     const charter = await ProjectCharter.findById(charterId).lean();
// //     if (!charter) {
// //       return res.status(404).json({ message: 'Charter not found' });
// //     }

// //     // only approvers can sign
// //     const approverIds = (charter.approvers || []).map((a) => String(a));
// //     if (!approverIds.includes(String(userId))) {
// //       return res.status(403).json({ message: 'Only approvers can sign' });
// //     }

// //     await CharterSignature.findOneAndUpdate(
// //       { charterId, userId },
// //       {
// //         charterId,
// //         userId,
// //         status,
// //         remarks,
// //         signedAt: new Date(),
// //       },
// //       { upsert: true, new: true }
// //     );

// //     // notify other approvers + project owner
// //     const project = await Project.findById(charter.projectId)
// //       .populate('ownerId', 'email name fullName')
// //       .lean();

// //     const users = await User.find({ _id: { $in: charter.approvers } })
// //       .select('email name fullName')
// //       .lean();
// //     const emails = users.map((u) => u.email).filter(Boolean);
// //     if (project?.ownerId?.email) {
// //       emails.push(project.ownerId.email);
// //     }

// //     await sendEmail(
// //       emails,
// //       `Charter ${status}`,
// //       `<p>A charter for project <b>${project?.name || ''}</b> has been <b>${status}</b>.</p>${
// //         remarks ? `<p><b>Remarks:</b> ${remarks}</p>` : ''
// //       }`
// //     );

// //     const signatures = await CharterSignature.find({ charterId })
// //       .populate('userId', 'name fullName email')
// //       .lean();

// //     res.json({ charter, signatures });
// //   } catch (err) {
// //     console.error('signCharter error', err);
// //     res.status(500).json({ message: 'Failed to sign charter' });
// //   }
// // };

// // controllers/projectWorkspaceController.js

// // controllers/projectWorkspaceController.js

// exports.signCharter = async (req, res) => {
//   try {
//     const { status, remarks = '' } = req.body;

//     // accept either /charter/:charterId/sign or /charter/:id/sign
//     const charterId = req.params.charterId || req.params.id;
//     const userId = req.user?._id;

//     if (!userId) {
//       return res.status(401).json({ message: 'Authentication required' });
//     }

//     if (!charterId) {
//       return res.status(400).json({ message: 'charterId is required' });
//     }

//     const allowedStatuses = ['Approved', 'Rejected'];
//     if (!allowedStatuses.includes(status)) {
//       return res
//         .status(400)
//         .json({ message: `Invalid status. Allowed: ${allowedStatuses.join(', ')}` });
//     }

//     const charter = await ProjectCharter.findById(charterId).lean();
//     if (!charter) {
//       return res.status(404).json({ message: 'Charter not found' });
//     }

//     // only approvers can sign
//     const approverIds = (charter.approvers || []).map((a) => String(a));
//     if (!approverIds.includes(String(userId))) {
//       return res.status(403).json({ message: 'Only approvers can sign' });
//     }

//     // 🔹 Upsert using updateOne (simpler, fewer chances of validator quirks)
//     await CharterSignature.updateOne(
//       { charterId, userId },
//       {
//         $set: {
//           charterId,
//           userId,
//           status,
//           remarks,
//           signedAt: new Date(),
//         },
//       },
//       { upsert: true }
//     );

//     // notify other approvers + project owner
//     const project = await Project.findById(charter.projectId)
//       .populate('ownerId', 'email name fullName')
//       .lean();

//     const users = await User.find({ _id: { $in: charter.approvers } })
//       .select('email name fullName email')
//       .lean();

//     const emails = users.map((u) => u.email).filter(Boolean);
//     if (project?.ownerId?.email) {
//       emails.push(project.ownerId.email);
//     }

//     await sendEmail(
//       emails,
//       `Charter ${status}`,
//       `<p>A charter for project <b>${project?.name || ''}</b> has been <b>${status}</b>.</p>${
//         remarks ? `<p><b>Remarks:</b> ${remarks}</p>` : ''
//       }`
//     );

//     // return updated signature list
//     const signatures = await CharterSignature.find({ charterId })
//       .populate('userId', 'name fullName email')
//       .lean();

//     res.json({ charter, signatures });
//   } catch (err) {
//     console.error('signCharter error', err);
//     // 🔹 temporary: also send error message back so you can see what's going on
//     res.status(500).json({
//       message: 'Failed to sign charter',
//       error: err.message,
//     });
//   }
// };


// // ---------- Notes ----------

// // GET /projects/:id/notes
// exports.listNotes = async (req, res) => {
//   try {
//     const notes = await ProjectNote.find({
//       projectId: req.params.id,
//       authorId: req.user?._id,
//     })
//       .sort({ createdAt: -1 })
//       .lean();
//     res.json(notes);
//   } catch (err) {
//     console.error('listNotes error', err);
//     res.status(500).json({ message: 'Failed to load notes' });
//   }
// };

// // POST /projects/:id/notes
// exports.addNote = async (req, res) => {
//   try {
//     const note = await ProjectNote.create({
//       projectId: req.params.id,
//       authorId: req.user?._id,
//       text: req.body.text || '',
//       date: new Date(),
//     });
//     res.status(201).json(note);
//   } catch (err) {
//     console.error('addNote error', err);
//     res.status(500).json({ message: 'Failed to create note' });
//   }
// };

// // ---------- Files ----------

// // GET /projects/:id/files
// exports.listFiles = async (req, res) => {
//   try {
//     const files = await ProjectFile.find({ projectId: req.params.id })
//       .populate('uploadedBy', 'name fullName email')
//       .sort({ createdAt: -1 })
//       .lean();
//     res.json(files);
//   } catch (err) {
//     console.error('listFiles error', err);
//     res.status(500).json({ message: 'Failed to load files' });
//   }
// };

// // POST /projects/:id/files
// exports.uploadFiles = async (req, res) => {
//   try {
//     const projectId = req.params.id;
//     const created = await ProjectFile.insertMany(
//       (req.files || []).map((f) => ({
//         projectId,
//         uploadedBy: req.user?._id,
//         filename: f.originalname,
//         path: f.path,
//         size: f.size,
//       }))
//     );
//     res.status(201).json(created);
//   } catch (err) {
//     console.error('uploadFiles error', err);
//     res.status(500).json({ message: 'Failed to upload files' });
//   }
// };

// // GET /projects/:projectId/files/:fileId/download
// exports.downloadFile = async (req, res) => {
//   try {
//     const file = await ProjectFile.findOne({
//       _id: req.params.fileId,
//       projectId: req.params.projectId,
//     }).lean();
//     if (!file) {
//       return res.status(404).json({ message: 'File not found' });
//     }
//     const abs = path.resolve(file.path);
//     if (!fs.existsSync(abs)) {
//       return res.status(404).json({ message: 'File path not found' });
//     }
//     res.download(abs, file.filename);
//   } catch (err) {
//     console.error('downloadFile error', err);
//     res.status(500).json({ message: 'Failed to download file' });
//   }
// };

// // DELETE /projects/:projectId/files/:fileId
// exports.deleteFile = async (req, res) => {
//   try {
//     const file = await ProjectFile.findOneAndDelete({
//       _id: req.params.fileId,
//       projectId: req.params.projectId,
//     }).lean();
//     if (file && file.path) {
//       const abs = path.resolve(file.path);
//       if (fs.existsSync(abs)) {
//         fs.unlink(abs, () => {});
//       }
//     }
//     const files = await ProjectFile.find({ projectId: req.params.projectId })
//       .sort({ createdAt: -1 })
//       .lean();
//     res.json(files);
//   } catch (err) {
//     console.error('deleteFile error', err);
//     res.status(500).json({ message: 'Failed to delete file' });
//   }
// };

// // ---------- Plan / Implementation Plan ----------

// // GET /projects/:id/plan
// exports.listPlanItems = async (req, res) => {
//   try {
//     const items = await ProjectPlanItem.find({ projectId: req.params.id })
//       .sort({ dueDate: 1, startDate: 1 })
//       .lean();
//     res.json(items);
//   } catch (err) {
//     console.error('listPlanItems error', err);
//     res.status(500).json({ message: 'Failed to load plan' });
//   }
// };

// // POST /projects/:id/plan
// exports.createPlanItem = async (req, res) => {
//   try {
//     const projectId = req.params.id;

//     if (!(await isCharterApproved(projectId))) {
//       return res.status(403).json({
//         message: 'Project charter must be fully approved before adding plan items.',
//       });
//     }

//     if (!(await canManagePlan(projectId, req.user))) {
//       return res.status(403).json({
//         message: 'Only Lead / Project Manager / Admin can create plan items.',
//       });
//     }

//     const payload = {
//       projectId,
//       title: req.body.title,
//       description: req.body.description,
//       startDate: req.body.startDate || null,
//       dueDate: req.body.dueDate || null,
//       type: req.body.type || 'Milestone',
//       percentComplete: Number(req.body.percentComplete || 0),
//     };

//     const created = await ProjectPlanItem.create(payload);
//     res.status(201).json(created);
//   } catch (err) {
//     console.error('createPlanItem error', err);
//     res.status(500).json({ message: 'Failed to create plan item' });
//   }
// };

// // PUT /projects/:id/plan/:planId
// exports.updatePlanItem = async (req, res) => {
//   try {
//     const projectId = req.params.id;

//     if (!(await canManagePlan(projectId, req.user))) {
//       return res.status(403).json({
//         message: 'Only Lead / Project Manager / Admin can update plan items.',
//       });
//     }

//     const update = {
//       title: req.body.title,
//       description: req.body.description,
//       startDate: req.body.startDate || null,
//       dueDate: req.body.dueDate || null,
//       type: req.body.type || 'Milestone',
//       percentComplete: Number(req.body.percentComplete || 0),
//     };

//     const item = await ProjectPlanItem.findOneAndUpdate(
//       { _id: req.params.planId, projectId },
//       update,
//       { new: true }
//     );
//     if (!item) {
//       return res.status(404).json({ message: 'Plan item not found' });
//     }

//     res.json(item);
//   } catch (err) {
//     console.error('updatePlanItem error', err);
//     res.status(500).json({ message: 'Failed to update plan item' });
//   }
// };

// // DELETE /projects/:id/plan/:planId
// exports.deletePlanItem = async (req, res) => {
//   try {
//     const projectId = req.params.id;
//     const planId = req.params.planId;

//     if (!(await canManagePlan(projectId, req.user))) {
//       return res.status(403).json({
//         message: 'Only Lead / Project Manager / Admin can delete plan items.',
//       });
//     }

//     const [taskRef, depRef] = await Promise.all([
//       ProjectTask.find({ projectId, planItemId: planId })
//         .select('title')
//         .lean(),
//       ProjectDependency.find({ projectId, planItemId: planId })
//         .select('description')
//         .lean(),
//     ]);

//     if (taskRef.length || depRef.length) {
//       return res.status(409).json({
//         message:
//           'This plan item cannot be deleted because tasks/dependencies are linked to it.',
//         tasks: taskRef.map((t) => t.title),
//         dependencies: depRef.map((d) => d.description),
//       });
//     }

//     await ProjectPlanItem.deleteOne({ _id: planId, projectId });
//     res.json({ ok: true });
//   } catch (err) {
//     console.error('deletePlanItem error', err);
//     res.status(500).json({ message: 'Failed to delete plan item' });
//   }
// };

// // ---------- Dependencies ----------

// // GET /projects/:id/dependencies
// exports.listDependencies = async (req, res) => {
//   try {
//     const deps = await ProjectDependency.find({ projectId: req.params.id })
//       .populate('planItemId', 'title')
//       .populate('taskId', 'title status')
//       .lean();
//     res.json(deps);
//   } catch (err) {
//     console.error('listDependencies error', err);
//     res.status(500).json({ message: 'Failed to load dependencies' });
//   }
// };

// // POST /projects/:id/dependencies
// exports.createDependency = async (req, res) => {
//   try {
//     const projectId = req.params.id;
//     const dep = await ProjectDependency.create({
//       projectId,
//       description: req.body.description,
//       planItemId: req.body.planItemId || undefined,
//       taskId: req.body.taskId || undefined,
//       status: req.body.status || 'Open',
//     });
//     res.status(201).json(dep);
//   } catch (err) {
//     console.error('createDependency error', err);
//     res.status(500).json({ message: 'Failed to create dependency' });
//   }
// };

// // ---------- Gantt / Combined data ----------

// // GET /projects/:id/gantt/combined
// exports.getCombinedGantt = async (req, res) => {
//   try {
//     const projectId = req.params.id;
//     const [plan, tasks] = await Promise.all([
//       ProjectPlanItem.find({ projectId }).lean(),
//       ProjectTask.find({ projectId }).lean(),
//     ]);
//     res.json({ plan, tasks });
//   } catch (err) {
//     console.error('getCombinedGantt error', err);
//     res.status(500).json({ message: 'Failed to load gantt data' });
//   }
// };

// // ---------- Dashboard ----------

// // GET /projects/:id/dashboard
// exports.getDashboard = async (req, res) => {
//   try {
//     const projectId = req.params.id;

//     const [tasks, plan] = await Promise.all([
//       ProjectTask.find({ projectId }).lean(),
//       ProjectPlanItem.find({ projectId }).lean(),
//     ]);

//     const tasksByStatus = {};
//     tasks.forEach((t) => {
//       const key = t.status || 'Unknown';
//       tasksByStatus[key] = (tasksByStatus[key] || 0) + 1;
//     });

//     const planByType = {};
//     plan.forEach((p) => {
//       const key = p.type || 'Other';
//       planByType[key] = (planByType[key] || 0) + 1;
//     });

//     res.json({
//       tasksByStatus,
//       planByType,
//     });
//   } catch (err) {
//     console.error('getDashboard error', err);
//     res.status(500).json({ message: 'Failed to load dashboard' });
//   }
// };

// // ---------- Chat & conversations ----------

// // GET /projects/:id/chat
// exports.listChatMessages = async (req, res) => {
//   try {
//     const projectId = req.params.id;
//     const msgs = await ProjectChatMessage.find({ projectId })
//       .populate('authorId', 'name fullName email')
//       .sort({ createdAt: 1 })
//       .lean();

//     res.json(msgs);
//   } catch (err) {
//     console.error('listChatMessages error', err);
//     res.status(500).json({ message: 'Failed to load chat' });
//   }
// };

// // POST /projects/:id/chat
// exports.sendChatMessage = async (req, res) => {
//   try {
//     const projectId = req.params.id;
//     const userId = req.user?._id;

//     if (!userId) {
//       return res.status(401).json({ message: 'Authentication required' });
//     }

//     const attachments =
//       (req.files || []).map((f) => ({
//         filename: f.originalname,
//         path: f.path,
//         size: f.size,
//       })) || [];

//     const msg = await ProjectChatMessage.create({
//       projectId,
//       authorId: userId,
//       text: req.body.text || '',
//       attachments,
//       createdAt: new Date(),
//     });

//     // unread for all project members except author
//     const members = await ProjectMember.find({ projectId })
//       .populate('userId', 'email')
//       .lean();
//     const unreadDocs = members
//       .filter((m) => !sameId(m.userId?._id, userId))
//       .map((m) => ({
//         messageId: msg._id,
//         userId: m.userId?._id,
//         projectId,
//         readAt: null,
//       }));

//     if (unreadDocs.length) {
//       await MessageReadReceipt.insertMany(unreadDocs);
//     }

//     // email notification to team
//     const emails = members
//       .map((m) => m.userId?.email)
//       .filter(Boolean)
//       .filter((e, idx, arr) => arr.indexOf(e) === idx);

//     await sendEmail(
//       emails,
//       'New project message',
//       `<p>A new message was posted in project chat.</p><p>${(req.body.text || '')
//         .substring(0, 500)
//         .replace(/\n/g, '<br>')}</p>`
//     );

//     const populated = await ProjectChatMessage.findById(msg._id)
//       .populate('authorId', 'name fullName email')
//       .lean();

//     res.status(201).json(populated);
//   } catch (err) {
//     console.error('sendChatMessage error', err);
//     res.status(500).json({ message: 'Failed to send message' });
//   }
// };

// // POST /chat/:id/read
// exports.markChatRead = async (req, res) => {
//   try {
//     const messageId = req.params.id;
//     const userId = req.user?._id;
//     if (!userId) {
//       return res.status(401).json({ message: 'Authentication required' });
//     }

//     await MessageReadReceipt.updateOne(
//       { messageId, userId },
//       { $set: { readAt: new Date() } },
//       { upsert: true }
//     );

//     res.json({ ok: true });
//   } catch (err) {
//     console.error('markChatRead error', err);
//     res.status(500).json({ message: 'Failed to mark message as read' });
//   }
// };

// // GET /projects/:id/chat/unread-counts
// exports.getChatUnreadCounts = async (req, res) => {
//   try {
//     const projectId = req.params.id;
//     const userId = req.user?._id;
//     if (!userId) {
//       return res.status(401).json({ message: 'Authentication required' });
//     }

//     const count = await MessageReadReceipt.countDocuments({
//       projectId,
//       userId,
//       readAt: null,
//     });

//     res.json({ unread: count });
//   } catch (err) {
//     console.error('getChatUnreadCounts error', err);
//     res.status(500).json({ message: 'Failed to load unread counts' });
//   }
// };

const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const Project = require('../models/Project');
const User = require('../models/User');
const ProjectMember = require('../models/ProjectMember');
const ProjectNote = require('../models/ProjectNote');
const ProjectFile = require('../models/ProjectFile');
const ProjectChatMessage = require('../models/ProjectChatMessage');
const MessageReadReceipt = require('../models/MessageReadReceipt');
const ProjectPlanItem = require('../models/ProjectPlanItem');
const ProjectTask = require('../models/ProjectTask');
const ProjectDependency = require('../models/ProjectDependency');
const ProjectCharter = require('../models/ProjectCharter');
const CharterSignature = require('../models/CharterSignature');

// ---------- email helper ----------

let transport = null;

function getTransport() {
  if (transport) return transport;

  if (
    !process.env.SMTP_HOST ||
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASS
  ) {
    console.warn(
      '[workspace] SMTP_* env vars not set, email notifications disabled.'
    );
    return null;
  }

  transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return transport;
}

async function sendEmail(to, subject, html) {
  try {
    const t = getTransport();
    const list = Array.isArray(to) ? to : [to];
    const filtered = list.filter(Boolean);
    if (!t || !filtered.length) return;
    await t.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: filtered.join(','),
      subject,
      html,
    });
  } catch (err) {
    console.error('sendEmail error (ignored)', err.message || err);
  }
}

// ---------- helpers ----------

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

/**
 * PLAN PERMISSIONS:
 * We use ONLY workspace roles (ProjectMember.role) – not global user roles.
 * Allowed workspace roles = ['Owner', 'PM']  => your "Lead / PM / Admin".
 */
async function canManagePlan(projectId, user) {
  if (!user) return false;
  const member = await ProjectMember.findOne({
    projectId,
    userId: user._id,
  }).lean();
  if (!member) return false;

  const allowedRoles = ["Admin", "Project Owner", "Project Lead", "Project Manager", "Manager", "Lead"];
  return allowedRoles.includes(member.role);
}

// ---------- Members ----------

// GET /projects/:id/members
exports.getMembers = async (req, res) => {
  try {
    const members = await ProjectMember.find({ projectId: req.params.id })
      .populate('userId', 'name fullName email')
      .lean();
    res.json(members);
  } catch (err) {
    console.error('getMembers error', err);
    res.status(500).json({ message: 'Failed to load project members' });
  }
};

// POST /projects/:id/members
exports.addMembers = async (req, res) => {
  try {
    const projectId = req.params.id;
    const { userIds = [], role = 'Team Member' } = req.body;

    if (!Array.isArray(userIds) || !userIds.length) {
      return res.status(400).json({ message: 'userIds are required' });
    }

    // Make sure we know who is adding the members
    const currentUserId = req.user && req.user._id;
    if (!currentUserId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const existing = await ProjectMember.find({ projectId }).lean();
    const existingSet = new Set(existing.map((m) => String(m.userId)));

    const now = new Date();

    const docs = userIds
      .filter((id) => !existingSet.has(String(id)))
      .map((userId) => ({
        projectId,
        userId,
        role, // 'Owner' / 'PM' / 'Member' according to your enum
        addedBy: currentUserId,
        addedAt: now,
      }));

    if (docs.length) {
      await ProjectMember.insertMany(docs);
    }

    const members = await ProjectMember.find({ projectId })
      .populate('userId', 'name fullName email')
      .lean();

    res.status(201).json(members);
  } catch (err) {
    console.error('addMembers error', err);
    res.status(500).json({ message: 'Failed to add members' });
  }
};

// PUT /projects/:id/members/:memberId
exports.updateMember = async (req, res) => {
  try {
    const { role } = req.body;
    await ProjectMember.findOneAndUpdate(
      { _id: req.params.memberId, projectId: req.params.id },
      { role },
      { new: true }
    );

    const members = await ProjectMember.find({ projectId: req.params.id })
      .populate('userId', 'name fullName email')
      .lean();
    res.json(members);
  } catch (err) {
    console.error('updateMember error', err);
    res.status(500).json({ message: 'Failed to update member' });
  }
};

// DELETE /projects/:id/members/:memberId
exports.removeMember = async (req, res) => {
  try {
    await ProjectMember.deleteOne({
      _id: req.params.memberId,
      projectId: req.params.id,
    });
    const members = await ProjectMember.find({ projectId: req.params.id })
      .populate('userId', 'name fullName email')
      .lean();
    res.json(members);
  } catch (err) {
    console.error('removeMember error', err);
    res.status(500).json({ message: 'Failed to remove member' });
  }
};

// ---------- Charter ----------

// GET /projects/:id/charter
exports.getCharter = async (req, res) => {
  try {
    const projectId = req.params.id;
    const charter = await ProjectCharter.findOne({ projectId }).lean();
    if (!charter) {
      return res.json(null);
    }
    const signatures = await CharterSignature.find({
      charterId: charter._id,
    })
      .populate('userId', 'name fullName email')
      .lean();

    res.json({ charter, signatures });
  } catch (err) {
    console.error('getCharter error', err);
    res.status(500).json({ message: 'Failed to load charter' });
  }
};

// POST /projects/:id/charter
exports.upsertCharter = async (req, res) => {
  try {
    const projectId = req.params.id;
    const {
      purpose = '',
      scope = '',
      objectives = '',
      risks = '',
      assumptions = '',
      approvers = [],
    } = req.body;

    const payload = {
      projectId,
      purpose,
      scope,
      objectives,
      risks,
      assumptions,
      approvers,
    };

    const charter = await ProjectCharter.findOneAndUpdate(
      { projectId },
      payload,
      { new: true, upsert: true }
    );

    res.status(201).json(charter);
  } catch (err) {
    console.error('upsertCharter error', err);
    res.status(500).json({ message: 'Failed to save charter' });
  }
};

// POST /charter/:charterId/approvers
exports.updateCharterApprovers = async (req, res) => {
  try {
    const { approvers = [] } = req.body;
    const charter = await ProjectCharter.findByIdAndUpdate(
      req.params.charterId,
      { approvers },
      { new: true }
    );
    if (!charter) {
      return res.status(404).json({ message: 'Charter not found' });
    }
    res.json(charter);
  } catch (err) {
    console.error('updateCharterApprovers error', err);
    res.status(500).json({ message: 'Failed to update approvers' });
  }
};

// POST /charter/:charterId/sign
exports.signCharter = async (req, res) => {
  try {
    const { status, remarks = '' } = req.body;

    const charterId = req.params.charterId || req.params.id;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!charterId) {
      return res.status(400).json({ message: 'charterId is required' });
    }

    const allowedStatuses = ['Approved', 'Rejected'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Allowed: ${allowedStatuses.join(', ')}`,
      });
    }

    const charter = await ProjectCharter.findById(charterId).lean();
    if (!charter) {
      return res.status(404).json({ message: 'Charter not found' });
    }

    // only approvers can sign
    const approverIds = (charter.approvers || []).map((a) => String(a));
    if (!approverIds.includes(String(userId))) {
      return res.status(403).json({ message: 'Only approvers can sign' });
    }

    await CharterSignature.updateOne(
      { charterId, userId },
      {
        $set: {
          charterId,
          userId,
          status,
          remarks,
          signedAt: new Date(),
        },
      },
      { upsert: true }
    );

    const project = await Project.findById(charter.projectId)
      .populate('ownerId', 'email name fullName')
      .lean();

    const users = await User.find({ _id: { $in: charter.approvers } })
      .select('email name fullName email')
      .lean();

    const emails = users.map((u) => u.email).filter(Boolean);
    if (project?.ownerId?.email) {
      emails.push(project.ownerId.email);
    }

    await sendEmail(
      emails,
      `Charter ${status}`,
      `<p>A charter for project <b>${project?.name || ''}</b> has been <b>${status}</b>.</p>${
        remarks ? `<p><b>Remarks:</b> ${remarks}</p>` : ''
      }`
    );

    const signatures = await CharterSignature.find({ charterId })
      .populate('userId', 'name fullName email')
      .lean();

    res.json({ charter, signatures });
  } catch (err) {
    console.error('signCharter error', err);
    res.status(500).json({
      message: 'Failed to sign charter',
      error: err.message,
    });
  }
};

// ---------- Notes ----------

// GET /projects/:id/notes
exports.listNotes = async (req, res) => {
  try {
    const notes = await ProjectNote.find({
      projectId: req.params.id,
      authorId: req.user?._id,
    })
      .sort({ createdAt: -1 })
      .lean();
    res.json(notes);
  } catch (err) {
    console.error('listNotes error', err);
    res.status(500).json({ message: 'Failed to load notes' });
  }
};

// POST /projects/:id/notes
exports.addNote = async (req, res) => {
  try {
    const note = await ProjectNote.create({
      projectId: req.params.id,
      authorId: req.user?._id,
      text: req.body.text || '',
      date: new Date(),
    });
    res.status(201).json(note);
  } catch (err) {
    console.error('addNote error', err);
    res.status(500).json({ message: 'Failed to create note' });
  }
};

// ---------- Files ----------

// GET /projects/:id/files
exports.listFiles = async (req, res) => {
  try {
    const files = await ProjectFile.find({ projectId: req.params.id })
      .populate('uploadedBy', 'name fullName email')
      .sort({ createdAt: -1 })
      .lean();
    res.json(files);
  } catch (err) {
    console.error('listFiles error', err);
    res.status(500).json({ message: 'Failed to load files' });
  }
};

// POST /projects/:id/files
exports.uploadFiles = async (req, res) => {
  try {
    const projectId = req.params.id;
    const created = await ProjectFile.insertMany(
      (req.files || []).map((f) => ({
        projectId,
        uploadedBy: req.user?._id,
        filename: f.originalname,
        path: f.path,
        size: f.size,
      }))
    );
    res.status(201).json(created);
  } catch (err) {
    console.error('uploadFiles error', err);
    res.status(500).json({ message: 'Failed to upload files' });
  }
};

// GET /projects/:projectId/files/:fileId/download
exports.downloadFile = async (req, res) => {
  try {
    const file = await ProjectFile.findOne({
      _id: req.params.fileId,
      projectId: req.params.projectId,
    }).lean();
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }
    const abs = path.resolve(file.path);
    if (!fs.existsSync(abs)) {
      return res.status(404).json({ message: 'File path not found' });
    }
    res.download(abs, file.filename);
  } catch (err) {
    console.error('downloadFile error', err);
    res.status(500).json({ message: 'Failed to download file' });
  }
};

// DELETE /projects/:projectId/files/:fileId
exports.deleteFile = async (req, res) => {
  try {
    const file = await ProjectFile.findOneAndDelete({
      _id: req.params.fileId,
      projectId: req.params.projectId,
    }).lean();
    if (file && file.path) {
      const abs = path.resolve(file.path);
      if (fs.existsSync(abs)) {
        fs.unlink(abs, () => {});
      }
    }
    const files = await ProjectFile.find({ projectId: req.params.projectId })
      .sort({ createdAt: -1 })
      .lean();
    res.json(files);
  } catch (err) {
    console.error('deleteFile error', err);
    res.status(500).json({ message: 'Failed to delete file' });
  }
};

// ---------- Plan / Implementation Plan ----------

// GET /projects/:id/plan
exports.listPlanItems = async (req, res) => {
  try {
    const items = await ProjectPlanItem.find({ projectId: req.params.id })
      .sort({ dueDate: 1, startDate: 1 })
      .lean();
    res.json(items);
  } catch (err) {
    console.error('listPlanItems error', err);
    res.status(500).json({ message: 'Failed to load plan' });
  }
};

// POST /projects/:id/plan
exports.createPlanItem = async (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.user && req.user._id;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Charter must be approved first
    if (!(await isCharterApproved(projectId))) {
      return res.status(403).json({
        message:
          'Project charter must be fully approved before adding plan items.',
      });
    }

    // Only workspace Owner/PM can create plan items
    if (!(await canManagePlan(projectId, req.user))) {
      return res.status(403).json({
        message: 'Only Lead / Project Manager / Admin can create plan items.',
      });
    }

    const payload = {
      projectId,
      type: req.body.type || 'Milestone',
      title: req.body.title,
      description: req.body.description || '',
      ownerId: req.body.ownerId || userId, // REQUIRED by ProjectPlanItem schema
      startDate: req.body.startDate || null,
      dueDate: req.body.dueDate || null,
      percentComplete: Number(req.body.percentComplete || 0),
      dependsOn: Array.isArray(req.body.dependsOn)
        ? req.body.dependsOn
        : [],
    };

    const created = await ProjectPlanItem.create(payload);
    res.status(201).json(created);
  } catch (err) {
    console.error('createPlanItem error', err);
    res.status(500).json({
      message: 'Failed to create plan item',
      error: err.message || String(err),
    });
  }
};

// PUT /projects/:id/plan/:planId
exports.updatePlanItem = async (req, res) => {
  try {
    const projectId = req.params.id;

    if (!(await canManagePlan(projectId, req.user))) {
      return res.status(403).json({
        message: 'Only Lead / Project Manager / Admin can update plan items.',
      });
    }

    const update = {
      type: req.body.type || 'Milestone',
      title: req.body.title,
      description: req.body.description || '',
      startDate: req.body.startDate || null,
      dueDate: req.body.dueDate || null,
      percentComplete: Number(req.body.percentComplete || 0),
      dependsOn: Array.isArray(req.body.dependsOn)
        ? req.body.dependsOn
        : [],
    };

    const item = await ProjectPlanItem.findOneAndUpdate(
      { _id: req.params.planId, projectId },
      update,
      { new: true }
    );
    if (!item) {
      return res.status(404).json({ message: 'Plan item not found' });
    }

    res.json(item);
  } catch (err) {
    console.error('updatePlanItem error', err);
    res.status(500).json({ message: 'Failed to update plan item' });
  }
};

// DELETE /projects/:id/plan/:planId
exports.deletePlanItem = async (req, res) => {
  try {
    const projectId = req.params.id;
    const planId = req.params.planId;

    if (!(await canManagePlan(projectId, req.user))) {
      return res.status(403).json({
        message: 'Only Lead / Project Manager / Admin can delete plan items.',
      });
    }

    const [taskRef, depRef] = await Promise.all([
      ProjectTask.find({ projectId, planItemId: planId })
        .select('title')
        .lean(),
      ProjectDependency.find({ projectId, planItemId: planId })
        .select('description')
        .lean(),
    ]);

    if (taskRef.length || depRef.length) {
      return res.status(409).json({
        message:
          'This plan item cannot be deleted because tasks/dependencies are linked to it.',
        tasks: taskRef.map((t) => t.title),
        dependencies: depRef.map((d) => d.description),
      });
    }

    await ProjectPlanItem.deleteOne({ _id: planId, projectId });
    res.json({ ok: true });
  } catch (err) {
    console.error('deletePlanItem error', err);
    res.status(500).json({ message: 'Failed to delete plan item' });
  }
};

// ---------- Dependencies ----------

// GET /projects/:id/dependencies
exports.listDependencies = async (req, res) => {
  try {
    const deps = await ProjectDependency.find({ projectId: req.params.id })
      .populate('planItemId', 'title')
      .populate('taskId', 'title status')
      .lean();
    res.json(deps);
  } catch (err) {
    console.error('listDependencies error', err);
    res.status(500).json({ message: 'Failed to load dependencies' });
  }
};

// POST /projects/:id/dependencies
exports.createDependency = async (req, res) => {
  try {
    const projectId = req.params.id;
    const dep = await ProjectDependency.create({
      projectId,
      description: req.body.description,
      planItemId: req.body.planItemId || undefined,
      taskId: req.body.taskId || undefined,
      status: req.body.status || 'Open',
    });
    res.status(201).json(dep);
  } catch (err) {
    console.error('createDependency error', err);
    res.status(500).json({ message: 'Failed to create dependency', err});
  }
};

// ---------- Gantt / Combined data ----------

// GET /projects/:id/gantt/combined
exports.getCombinedGantt = async (req, res) => {
  try {
    const projectId = req.params.id;
    const [plan, tasks] = await Promise.all([
      ProjectPlanItem.find({ projectId }).lean(),
      ProjectTask.find({ projectId }).lean(),
    ]);
    res.json({ plan, tasks });
  } catch (err) {
    console.error('getCombinedGantt error', err);
    res.status(500).json({ message: 'Failed to load gantt data' });
  }
};

// ---------- Dashboard ----------

// GET /projects/:id/dashboard
exports.getDashboard = async (req, res) => {
  try {
    const projectId = req.params.id;

    const [tasks, plan] = await Promise.all([
      ProjectTask.find({ projectId }).lean(),
      ProjectPlanItem.find({ projectId }).lean(),
    ]);

    const tasksByStatus = {};
    tasks.forEach((t) => {
      const key = t.status || 'Unknown';
      tasksByStatus[key] = (tasksByStatus[key] || 0) + 1;
    });

    const planByType = {};
    plan.forEach((p) => {
      const key = p.type || 'Other';
      planByType[key] = (planByType[key] || 0) + 1;
    });

    res.json({
      tasksByStatus,
      planByType,
    });
  } catch (err) {
    console.error('getDashboard error', err);
    res.status(500).json({ message: 'Failed to load dashboard' });
  }
};

// ---------- Chat & conversations ----------

// GET /projects/:id/chat
exports.listChatMessages = async (req, res) => {
  try {
    const projectId = req.params.id;
    const msgs = await ProjectChatMessage.find({ projectId })
      .populate('authorId', 'name fullName email')
      .sort({ createdAt: 1 })
      .lean();

    res.json(msgs);
  } catch (err) {
    console.error('listChatMessages error', err);
    res.status(500).json({ message: 'Failed to load chat' });
  }
};

// POST /projects/:id/chat
exports.sendChatMessage = async (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const attachments =
      (req.files || []).map((f) => ({
        filename: f.originalname,
        path: f.path,
        size: f.size,
      })) || [];

    const msg = await ProjectChatMessage.create({
      projectId,
      authorId: userId,
      text: req.body.text || '',
      attachments,
      createdAt: new Date(),
    });

    // unread for all project members except author
    const members = await ProjectMember.find({ projectId })
      .populate('userId', 'email')
      .lean();
    const unreadDocs = members
      .filter((m) => !sameId(m.userId?._id, userId))
      .map((m) => ({
        messageId: msg._id,
        userId: m.userId?._id,
        projectId,
        readAt: null,
      }));

    if (unreadDocs.length) {
      await MessageReadReceipt.insertMany(unreadDocs);
    }

    // email notification to team
    const emails = members
      .map((m) => m.userId?.email)
      .filter(Boolean)
      .filter((e, idx, arr) => arr.indexOf(e) === idx);

    await sendEmail(
      emails,
      'New project message',
      `<p>A new message was posted in project chat.</p><p>${(req.body.text || '')
        .substring(0, 500)
        .replace(/\n/g, '<br>')}</p>`
    );

    const populated = await ProjectChatMessage.findById(msg._id)
      .populate('authorId', 'name fullName email')
      .lean();

    res.status(201).json(populated);
  } catch (err) {
    console.error('sendChatMessage error', err);
    res.status(500).json({ message: 'Failed to send message' });
  }
};

// POST /chat/:id/read
exports.markChatRead = async (req, res) => {
  try {
    const messageId = req.params.id;
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    await MessageReadReceipt.updateOne(
      { messageId, userId },
      { $set: { readAt: new Date() } },
      { upsert: true }
    );

    res.json({ ok: true });
  } catch (err) {
    console.error('markChatRead error', err);
    res.status(500).json({ message: 'Failed to mark message as read' });
  }
};

// GET /projects/:id/chat/unread-counts
exports.getChatUnreadCounts = async (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const count = await MessageReadReceipt.countDocuments({
      projectId,
      userId,
      readAt: null,
    });

    res.json({ unread: count });
  } catch (err) {
    console.error('getChatUnreadCounts error', err);
    res.status(500).json({ message: 'Failed to load unread counts' });
  }
};
