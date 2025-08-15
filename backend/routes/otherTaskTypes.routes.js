const express = require("express");
const router = express.Router();
const { authenticate } = require("../middlewares/authMiddleware");
const ctrl = require("../controllers/otherTaskTypes.controller");
// assume you already apply auth middleware globally or wrap these with it

router.post("/", authenticate, ctrl.createType);
router.get("/", authenticate, ctrl.listTypes);
router.patch("/:id", authenticate, ctrl.updateType);
router.delete("/:id", authenticate, ctrl.remove);

module.exports = router;
