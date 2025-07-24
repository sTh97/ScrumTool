const express = require("express");
const router = express.Router();
const { authenticate } = require("../middlewares/authMiddleware");
const { authorizeAdmin } = require("../middlewares/roleMiddleware");
const {
  createRole,
  getAllRoles,
  updateRole,
  deleteRole
} = require("../controllers/roleController");

router.post("/", authenticate,  createRole);
router.get("/", authenticate,  getAllRoles);
router.put("/:id", authenticate,  updateRole);
router.delete("/:id", authenticate,  deleteRole);

module.exports = router;