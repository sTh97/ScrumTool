const express = require("express");
const router = express.Router();
const { authenticate } = require("../middlewares/authMiddleware");
const { authorizeAdmin } = require("../middlewares/roleMiddleware");
const {
  createUser,
  getAllUsers,
  updateUser,
  deactivateUser,
  reactivateUser,
  changeMyPassword 
} = require("../controllers/userController");

router.post("/", authenticate,  createUser);
router.get("/", authenticate,  getAllUsers);
router.put("/:id", authenticate,  updateUser);
router.put("/deactivate/:id", authenticate, authorizeAdmin, deactivateUser);
router.put("/reactivate/:id", authenticate, reactivateUser);
router.patch("/me/password", authenticate, changeMyPassword);


module.exports = router;