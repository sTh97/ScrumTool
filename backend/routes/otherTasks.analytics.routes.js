const router = require("express").Router();
const {authenticate} = require("../middlewares/authMiddleware"); // your existing auth
const { summary, timeseries, estimation, heatmap, usersComparison, distributions } =

require("../controllers/otherTasks.analytics.controller");

router.get("/summary", authenticate, summary);
router.get("/timeseries", authenticate, timeseries);
router.get("/estimation", authenticate, estimation);
router.get("/heatmap", authenticate, heatmap);
router.get("/users-comparison", authenticate, usersComparison);
router.get("/distributions", authenticate, distributions);

module.exports = router;
