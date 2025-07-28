const express = require("express");
const router = express.Router();
const impactController = require("../controllers/impactController");

router.get("/", impactController.getAllImpacts);
router.post("/", impactController.createImpact);
router.put("/:id", impactController.updateImpact);
router.delete("/:id", impactController.deleteImpact);

module.exports = router;
