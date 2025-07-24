const express = require("express");
const router = express.Router();
const { authenticate } = require("../middlewares/authMiddleware");
const { authorizeAdmin } = require("../middlewares/roleMiddleware");
const {
  createUser,
  getAllUsers,
  updateUser,
  deactivateUser,
  reactivateUser
} = require("../controllers/userController");

router.post("/", authenticate,  createUser);
router.get("/", authenticate,  getAllUsers);
router.put("/:id", authenticate,  updateUser);
router.put("/deactivate/:id", authenticate, authorizeAdmin, deactivateUser);
router.put("/reactivate/:id", authenticate, reactivateUser);


module.exports = router;