// // routes/sprintRoutes.js
// const express = require("express");
// const router = express.Router();
// const sprintController = require("../controllers/sprintController");
// const { authenticate } = require("../middlewares/authMiddleware");

// // CRUD routes
// router.post("/", authenticate, sprintController.createSprint);
// router.get("/", authenticate, sprintController.getAllSprints);
// router.put("/:id", authenticate, sprintController.updateSprint);
// router.delete("/:id", authenticate, sprintController.deleteSprint);

// // Assignment routes
// router.put("/:id/team", authenticate, sprintController.assignTeamToSprint);
// router.put("/:id/stories", authenticate, sprintController.assignStoriesToSprint);
// router.get("/:id/details", authenticate, sprintController.getSprintDetails);
// router.get('/details', sprintController.getAllSprints);




// module.exports = router;


// routes/sprintRoutes.js
const express = require("express");
const router = express.Router();
const sprintController = require("../controllers/sprintController");
const { authenticate } = require("../middlewares/authMiddleware");

// CRUD routes
router.post("/", authenticate, sprintController.createSprint);

// ✅ place this ABOVE /:id/details
router.get("/details", authenticate, sprintController.getAllSprints);

router.get("/:id/details", authenticate, sprintController.getSprintDetails);

router.get("/", authenticate, sprintController.getAllSprints);
router.put("/:id", authenticate, sprintController.updateSprint);
router.delete("/:id", authenticate, sprintController.deleteSprint);

// Assignment routes
router.put("/:id/team", authenticate, sprintController.assignTeamToSprint);
router.put("/:id/stories", authenticate, sprintController.assignStoriesToSprint);

module.exports = router;

