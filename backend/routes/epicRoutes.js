const express = require("express");
const router = express.Router();
const { createEpic, getEpics, updateEpic, deleteEpic } = require("../controllers/epicController");
const { authenticate } = require("../middlewares/authMiddleware");

router.post("/", authenticate, createEpic);
router.get("/", authenticate, getEpics);
router.put("/:id", authenticate, updateEpic);
router.delete("/:id", authenticate, deleteEpic);

module.exports = router;
