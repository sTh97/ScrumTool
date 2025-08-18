// // const express = require("express");
// // const router = express.Router();
// // const { authenticate } = require("../middlewares/authMiddleware");
// // const upload = require("../middlewares/multerDocs"); // as defined above
// // const docController = require("../controllers/documentationController");


// // router.post("/", authenticate, upload.array("attachments", 5), docController.createDocument);
// // router.put("/:id", authenticate, upload.array("attachments", 5), docController.updateDocument);
// // router.get("/", authenticate, docController.getAllDocuments);
// // router.get("/:id", authenticate, docController.getDocumentById);
// // router.get("/:id/versions", authenticate, docController.getVersionHistory);
// // router.post("/:id/restore/:version", authenticate, docController.restoreVersion);
// // router.delete("/:id/attachments/:fileId", authenticate, docController.deleteAttachment);

// // module.exports = router;

// const express = require("express");
// const router = express.Router();
// const upload = require("../middlewares/multerDocs"); // ✅ exists and exports multer instance
// const docController = require("../controllers/documentationController"); // ✅ all controller functions are defined
// const { authenticate } = require("../middlewares/authMiddleware"); // ✅ this is fine

// // ✅ ALL FUNCTIONS in docController must be defined
// router.post("/", authenticate, upload.array("attachments", 5), docController.createDocument);
// router.put("/:id", authenticate, upload.array("attachments", 5), docController.updateDocument);
// router.get("/", authenticate, docController.getAllDocuments);
// router.get("/:id", authenticate, docController.getDocumentById);
// router.get("/:id/versions", authenticate, docController.getVersionHistory);
// router.post("/:id/restore/:version", authenticate, docController.restoreVersion);
// router.delete("/:id/attachments/:fileId", authenticate, docController.deleteAttachment);
// router.put("/version/:versionId/baseline", docController.setBaselineVersion);

// module.exports = router;


const express = require("express");
const router = express.Router();
const upload = require("../middlewares/multerDocs");
const docController = require("../controllers/documentationController");
const { authenticate } = require("../middlewares/authMiddleware");

router.post("/", authenticate, upload.array("attachments", 5), docController.createDocument);
router.put("/:id", authenticate, upload.array("attachments", 5), docController.updateDocument);

router.get("/", authenticate, docController.getAllDocuments);
router.get("/:id", authenticate, docController.getDocumentById);
router.get("/:id/versions", authenticate, docController.getVersionHistory);
router.get("/version/:versionId", authenticate, docController.getVersionById);

// NOTE: param name here is :version (not :versionId). Controller now reads req.params.version.
router.post("/:id/restore/:version", authenticate, docController.restoreVersion);

// delete attachment from a *version*
router.delete("/version/:versionId/attachments/:filename", authenticate, docController.deleteAttachment);

// baseline
router.put("/version/:versionId/baseline", authenticate, docController.setBaselineVersion);

module.exports = router;
