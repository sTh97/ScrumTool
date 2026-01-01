// routes/projectTaskRoutes.js
const express = require('express');
const multer = require('multer');
const router = express.Router();
const { authenticate } = require("../middlewares/authMiddleware");

const {
  listByProject,
  createTask,
  getTask,
  updateTask,
  deleteTask,
  getTaskHistory,
  changeTaskStatus,
  attachFiles,
} = require('../controllers/projectTaskController');

// configure multer for task file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) =>
    cb(
      null,
      Date.now() + '_' + file.originalname.replace(/\s+/g, '_')
    ),
});
const upload = multer({ storage });

/**
 * Base path (in app.js):
 *   app.use('/api/project-tasks', require('./routes/projectTaskRoutes'));
 *
 * Endpoints:
 *   GET    /project/:projectId          → list tasks for a project
 *   POST   /                            → create task
 *   GET    /:taskId                     → get one task
 *   PATCH  /:taskId                     → update task (creator only)
 *   DELETE /:taskId                     → delete task (creator only)
 *   GET    /:taskId/history             → status change history
 *   PATCH  /:taskId/status              → change status (assignee / PM rules)
 *   POST   /:taskId/files               → attach files to task
 */

router.get('/project/:projectId', authenticate, listByProject);
router.post('/', authenticate, authenticate, createTask);
router.get('/:taskId', authenticate, getTask);
router.patch('/:taskId', authenticate, updateTask);
router.delete('/:taskId', authenticate, deleteTask);
router.get('/:taskId/history', authenticate, getTaskHistory);
router.patch('/:taskId/status', authenticate, changeTaskStatus);
router.post('/:taskId/files', authenticate, upload.array('files', 5), attachFiles);

module.exports = router;