const express = require('express');
const multer = require('multer');
// const upload = multer(); // memory storage
const { authenticate } = require('../middlewares/authMiddleware');
const C = require('../controllers/schemaController');
const router = express.Router();

const upload = multer({ limits: { fileSize: 50 * 1024 * 1024 } });

// All routes protected
router.post('/snapshots/upload', authenticate, upload.single('file'), C.uploadSnapshot);
router.get('/snapshots', authenticate, C.listSnapshots);

// OPTIONAL helper if you want to turn pasted text into a stored snapshot
router.post('/snapshots/from-text', authenticate, C.createSnapshotFromText);

// 🔹 NEW: preview diff without saving
router.post('/compare/preview', authenticate, C.previewCompare);

// 🔹 SAVE (now supports either snapshotId or pasted text)
router.post('/compare', authenticate, C.compare);

// List / get / delete / 🔹 update
router.get('/comparisons', authenticate, C.listComparisons);
router.get('/comparisons/:id', authenticate, C.getComparison);
router.delete('/comparisons/:id', authenticate, C.deleteComparison);
router.patch('/comparisons/:id', authenticate, C.updateComparison);

module.exports = router;
