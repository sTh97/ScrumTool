// // routes/projectWorkspaceRoutes.js
// const express = require('express');
// const multer = require('multer');
// const { authenticate } = require("../middlewares/authMiddleware");

// const {
//   getMembers,
//   addMembers,
//   updateMember,
//   removeMember,
//   getCharter,
//   upsertCharter,
//   updateCharterApprovers,
//   signCharter,
//   listNotes,
//   addNote,
//   listFiles,
//   uploadFiles,
//   downloadFile,
//   deleteFile,
//   listPlanItems,
//   createPlanItem,
//   updatePlanItem,
//   deletePlanItem,
//   listDependencies,
//   createDependency,
//   getCombinedGantt,
//   getDashboard,
//   listChatMessages,
//   sendChatMessage,
//   markChatRead,
//   getChatUnreadCounts,
// } = require('../controllers/projectWorkspaceController');

// const router = express.Router();

// // Upload configuration for project files + chat attachments
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, 'uploads/'),
//   filename: (req, file, cb) =>
//     cb(
//       null,
//       Date.now() + '_' + file.originalname.replace(/\s+/g, '_')
//     ),
// });
// const upload = multer({ storage });

// /**
//  * Base path (in app.js):
//  *   app.use('/api/workspace', require('./routes/projectWorkspaceRoutes'));
//  *
//  * Frontend calls (from ProjectWorkspace.jsx):
//  *
//  *   Members
//  *     GET    /projects/:id/members
//  *     POST   /projects/:id/members
//  *     PUT    /projects/:id/members/:memberId
//  *     DELETE /projects/:id/members/:memberId
//  *
//  *   Charter
//  *     GET    /projects/:id/charter
//  *     POST   /projects/:id/charter
//  *     POST   /charter/:charterId/approvers
//  *     POST   /charter/:charterId/sign
//  *
//  *   Notes
//  *     GET    /projects/:id/notes
//  *     POST   /projects/:id/notes
//  *
//  *   Files
//  *     GET    /projects/:id/files
//  *     POST   /projects/:id/files
//  *     GET    /projects/:projectId/files/:fileId/download
//  *     DELETE /projects/:projectId/files/:fileId
//  *
//  *   Plan / Implementation plan
//  *     GET    /projects/:id/plan
//  *     POST   /projects/:id/plan
//  *     PUT    /projects/:id/plan/:planId
//  *     DELETE /projects/:id/plan/:planId
//  *
//  *   Dependencies
//  *     GET    /projects/:id/dependencies
//  *     POST   /projects/:id/dependencies
//  *
//  *   Gantt
//  *     GET    /projects/:id/gantt/combined
//  *
//  *   Dashboard
//  *     GET    /projects/:id/dashboard
//  *
//  *   Chat
//  *     GET    /projects/:id/chat
//  *     POST   /projects/:id/chat
//  *     POST   /chat/:id/read
//  *     GET    /projects/:id/chat/unread-counts
//  */

// // Notes (no files for now, text only)
// const formOnly = multer();

// // Members
// router.get('/projects/:id/members', authenticate, getMembers);
// router.post('/projects/:id/members', authenticate, addMembers);
// router.put('/projects/:id/members/:memberId', authenticate, updateMember);
// router.delete('/projects/:id/members/:memberId', authenticate, removeMember);

// // Charter
// router.get('/projects/:id/charter', authenticate, getCharter);
// router.post('/projects/:id/charter', authenticate, upsertCharter);
// router.post('/charter/:charterId/approvers', authenticate, updateCharterApprovers);
// router.post('/charter/:charterId/sign', authenticate, signCharter);

// // Notes
// router.get('/projects/:id/notes', authenticate, listNotes);
// router.post('/projects/:id/notes', authenticate, formOnly.none(), addNote);

// // Files
// router.get('/projects/:id/files', authenticate, listFiles);
// router.post('/projects/:id/files', authenticate, upload.array('files', 10), uploadFiles);
// router.get(
//   '/projects/:projectId/files/:fileId/download',
//   authenticate, 
//   downloadFile
// );
// router.delete('/projects/:projectId/files/:fileId', authenticate, deleteFile);

// // Plan
// router.get('/projects/:id/plan', authenticate, listPlanItems);
// router.post('/projects/:id/plan', authenticate, createPlanItem);
// router.put('/projects/:id/plan/:planId', authenticate, updatePlanItem);
// router.delete('/projects/:id/plan/:planId', authenticate, deletePlanItem);

// // Dependencies
// router.get('/projects/:id/dependencies', authenticate, listDependencies);
// router.post('/projects/:id/dependencies', authenticate, createDependency);

// // Gantt
// router.get('/projects/:id/gantt/combined', authenticate, getCombinedGantt);

// // Dashboard
// router.get('/projects/:id/dashboard', authenticate, getDashboard);

// // Chat
// router.get('/projects/:id/chat', authenticate, listChatMessages);
// router.post(
//   '/projects/:id/chat',
//   upload.array('files', 3),
//   authenticate, 
//   sendChatMessage
// );
// router.post('/chat/:id/read', authenticate, markChatRead);
// router.get('/projects/:id/chat/unread-counts', authenticate, getChatUnreadCounts);

// module.exports = router;

const express = require('express');
const multer = require('multer');
const { authenticate } = require("../middlewares/authMiddleware");

const {
  getMembers,
  addMembers,
  updateMember,
  removeMember,
  getCharter,
  upsertCharter,
  updateCharterApprovers,
  signCharter,
  listNotes,
  addNote,
  listFiles,
  uploadFiles,
  downloadFile,
  deleteFile,
  listPlanItems,
  createPlanItem,
  updatePlanItem,
  deletePlanItem,
  listDependencies,
  createDependency,
  getCombinedGantt,
  getDashboard,
  listChatMessages,
  sendChatMessage,
  markChatRead,
  getChatUnreadCounts,
} = require('../controllers/projectWorkspaceController');

const router = express.Router();

// Upload configuration for project files + chat attachments
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) =>
    cb(
      null,
      Date.now() + '_' + file.originalname.replace(/\s+/g, '_')
    ),
});
const upload = multer({ storage });

// Notes (no files for now, text only)
const formOnly = multer();

// Members
router.get('/projects/:id/members', authenticate, getMembers);
router.post('/projects/:id/members', authenticate, addMembers);
router.put('/projects/:id/members/:memberId', authenticate, updateMember);
router.delete('/projects/:id/members/:memberId', authenticate, removeMember);

// Charter
router.get('/projects/:id/charter', authenticate, getCharter);
router.post('/projects/:id/charter', authenticate, upsertCharter);
router.post('/charter/:charterId/approvers', authenticate, updateCharterApprovers);
router.post('/charter/:charterId/sign', authenticate, signCharter);

// Notes
router.get('/projects/:id/notes', authenticate, listNotes);
router.post('/projects/:id/notes', authenticate, formOnly.none(), addNote);

// Files
router.get('/projects/:id/files', authenticate, listFiles);
router.post('/projects/:id/files', authenticate, upload.array('files', 10), uploadFiles);
router.get(
  '/projects/:projectId/files/:fileId/download',
  authenticate, 
  downloadFile
);
router.delete('/projects/:projectId/files/:fileId', authenticate, deleteFile);

// Plan
router.get('/projects/:id/plan', authenticate, listPlanItems);
router.post('/projects/:id/plan', authenticate, createPlanItem);
router.put('/projects/:id/plan/:planId', authenticate, updatePlanItem);
router.delete('/projects/:id/plan/:planId', authenticate, deletePlanItem);

// Dependencies
router.get('/projects/:id/dependencies', authenticate, listDependencies);
router.post('/projects/:id/dependencies', authenticate, createDependency);

// Gantt
router.get('/projects/:id/gantt/combined', authenticate, getCombinedGantt);

// Dashboard
router.get('/projects/:id/dashboard', authenticate, getDashboard);

// Chat
router.get('/projects/:id/chat', authenticate, listChatMessages);
router.post(
  '/projects/:id/chat',
  upload.array('files', 3),
  authenticate, 
  sendChatMessage
);
router.post('/chat/:id/read', authenticate, markChatRead);
router.get('/projects/:id/chat/unread-counts', authenticate, getChatUnreadCounts);

module.exports = router;
