// // routes/chatRoutes.js
// const express = require("express");
// const { body, query } = require("express-validator");
// const router = express.Router();

// const { authenticate } = require("../middlewares/authMiddleware"); // <-- your export
// const ctrl = require("../controllers/chatController");

// // protect all chat routes
// router.use(authenticate);

// // Search users for DMs or @mentions
// router.get("/users", [query("q").optional().isString()], ctrl.searchUsers);

// // List my conversations
// router.get("/conversations", ctrl.listConversations);

// // Create DM or Group
// router.post(
//   "/conversations",
//   [
//     body("type").isIn(["dm", "group"]),
//     body("memberIds").isArray({ min: 1 }),
//     body("name").optional().isString(),
//   ],
//   ctrl.createConversation
// );

// // Get last messages of a conversation
// router.get("/conversations/:id/messages", ctrl.getMessages);

// // Post a new message (triggers email intimation)
// router.post(
//   "/conversations/:id/messages",
//   [body("body").isString().notEmpty()],
//   ctrl.postMessage
// );

// module.exports = router;


// routes/chatRoutes.js
const express = require("express");
const { body, query } = require("express-validator");
const router = express.Router();

const { authenticate } = require("../middlewares/authMiddleware");
const ctrl = require("../controllers/chatController");

router.use(authenticate);

// users & conversations
router.get("/users", [query("q").optional().isString()], ctrl.searchUsers);
router.get("/conversations", ctrl.listConversations);
router.post(
  "/conversations",
  [ body("type").isIn(["dm","group"]), body("memberIds").isArray({min:1}), body("name").optional().isString() ],
  ctrl.createConversation
);

// messages
router.get("/conversations/:id/messages", ctrl.getMessages);
router.post("/conversations/:id/messages", [body("body").isString().notEmpty()], ctrl.postMessage);

// NEW: group management
router.patch("/conversations/:id/members", ctrl.addMembers);     // any group member can add
router.delete("/conversations/:id", ctrl.deleteConversation);    // only group creator can delete

module.exports = router;
