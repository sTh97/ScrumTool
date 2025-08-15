const express = require("express");
const router = express.Router();
const { authenticate } = require("../middlewares/authMiddleware");
const ctrl = require("../controllers/otherTasks.controller");

router.post("/", authenticate, ctrl.create);
router.get("/", authenticate, ctrl.list);
router.get("/:id", authenticate, ctrl.getOne);
router.patch("/:id", authenticate, ctrl.update);

router.post("/:id/start", authenticate, ctrl.start);
router.post("/:id/pause", authenticate, ctrl.pause);
router.post("/:id/resume", authenticate, ctrl.resume);
router.post("/:id/done", authenticate, ctrl.done);

module.exports = router;
