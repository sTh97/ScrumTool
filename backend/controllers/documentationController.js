// const Documentation = require("../models/Documentation");
// const DocumentationVersion = require("../models/DocumentationVersion");
// const User = require("../models/User");
// const Project = require("../models/Project");
// const fs = require("fs");
// const path = require("path");

// // 1. Create New Document (and initial version)
// exports.createDocument = async (req, res) => {
//   try {
//     const { projectId, title, documentType, content } = req.body;
//     const attachments = req.files.map(file => ({
//       filename: file.filename,
//       originalName: file.originalname,
//       size: file.size,
//       mimeType: file.mimetype,
//       filePath: file.path,
//     }));

//     const doc = await Documentation.create({
//       projectId,
//       title,
//       documentType,
//       content,
//       attachments,
//       createdBy: req.user._id,
//       updatedBy: req.user._id,
//     });

//     await DocumentationVersion.create({
//       documentationId: doc._id,
//       versionNumber: 1,
//       content,
//       attachments,
//       updatedBy: req.user._id,
//     });

//     res.status(201).json(doc);
//   } catch (err) {
//     res.status(500).json({ message: "Error creating document", error: err.message });
//   }
// };

// // 2. Update Document (creates new version)
// exports.updateDocument = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const userId = req.user._id;

//     const existingDoc = await Documentation.findById(id).populate("projectId");
//     if (!existingDoc) return res.status(404).json({ message: "Document not found" });

//     // Compare fields for changelog
//     const changes = [];
//     if (req.body.title && req.body.title !== existingDoc.title)
//       changes.push({ field: "title", oldValue: existingDoc.title, newValue: req.body.title });

//     if (req.body.documentType && req.body.documentType !== existingDoc.documentType)
//       changes.push({ field: "documentType", oldValue: existingDoc.documentType, newValue: req.body.documentType });

//     if (req.body.projectId && req.body.projectId !== String(existingDoc.projectId))
//       changes.push({ field: "projectId", oldValue: existingDoc.projectId, newValue: req.body.projectId });

//     if (req.body.content && req.body.content !== existingDoc.content)
//       changes.push({ field: "content", oldValue: "Previous content omitted", newValue: "New content omitted" });

//     const versionCount = await DocumentationVersion.countDocuments({ documentationId: id });
//     const attachments = req.files.map((file) => ({
//       filename: file.filename,
//       originalName: file.originalname,
//       size: file.size,
//       mimeType: file.mimetype,
//       filePath: file.path,
//     }));

//     // Save new version
//     const version = await DocumentationVersion.create({
//       documentationId: id,
//       versionNumber: versionCount + 1,
//       content: req.body.content,
//       attachments,
//       updatedBy: userId,
//       isBaselined: false,
//       title: req.body.title || existingDoc.title,
//       documentType: req.body.documentType || existingDoc.documentType,
//       projectId: req.body.projectId || existingDoc.projectId,
//       changeSummary: changes,
//     });

//     // Update main document
//     existingDoc.title = req.body.title || existingDoc.title;
//     existingDoc.documentType = req.body.documentType || existingDoc.documentType;
//     existingDoc.projectId = req.body.projectId || existingDoc.projectId;
//     existingDoc.content = req.body.content || existingDoc.content;
//     existingDoc.updatedBy = userId;
//     existingDoc.updatedAt = new Date();
//     existingDoc.latestVersion = version._id;
//     existingDoc.attachments = attachments;

//     await existingDoc.save();

//     res.status(200).json({ message: "Document updated and versioned successfully" });
//   } catch (err) {
//     console.error("Update error", err);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };


// // 3. Get Paginated Documents (with latest version)
// exports.getAllDocuments = async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = 10;
//     const skip = (page - 1) * limit;
//     const search = req.query.search || "";
//     const sortBy = req.query.sortBy || "createdAt";
//     const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

//     const query = {
//       $or: [
//         { title: { $regex: search, $options: "i" } },
//         { documentType: { $regex: search, $options: "i" } },
//       ],
//     };

//     const projectDocs = await Documentation.find(query)
//       .populate("projectId", "name")
//       .populate("createdBy", "name")
//       .sort({ [sortBy]: sortOrder })
//       .skip(skip)
//       .limit(limit)
//       .lean();

//     const docsWithLatest = await Promise.all(
//       projectDocs.map(async (doc) => {
//         const latestVersion = await DocumentationVersion.findOne({
//           documentationId: doc._id,
//         })
//           .populate("updatedBy", "name")
//           .sort({ versionNumber: -1 })
//           .lean();

//         return { ...doc, latestVersion };
//       })
//     );

//     const total = await Documentation.countDocuments(query);

//     res.json({
//       documents: docsWithLatest,
//       totalPages: Math.ceil(total / limit),
//     });
//   } catch (err) {
//     console.error("Error in getAllDocuments:", err);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

// // 4. Get Document Details with Version History
// exports.getDocumentById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const doc = await Documentation.findById(id)
//       .populate("createdBy", "name")
//       .populate("updatedBy", "name")
//       .populate("projectId", "name");

//     if (!doc) {
//       return res.status(404).json({ message: "Document not found" });
//     }

//     const versions = await DocumentationVersion.find({ documentationId: id })
//       .sort({ versionNumber: -1 })
//       .populate("updatedBy", "name");

//     const latestVersion = versions[0] || {};

//     const response = {
//       _id: doc._id,
//       title: doc.title,
//       documentType: doc.documentType,
//       createdBy: doc.createdBy,
//       updatedBy: doc.updatedBy,
//       createdAt: doc.createdAt,
//       updatedAt: doc.updatedAt,
//       project: doc.projectId,
//       latestVersion: {
//         versionNumber: latestVersion.versionNumber,
//         updatedAt: latestVersion.updatedAt,
//         updatedBy: latestVersion.updatedBy,
//         isBaselined: latestVersion.isBaselined,
//       },
//       content: latestVersion.content,
//       attachments: latestVersion.attachments,
//       versions: versions.map((v) => ({
//         _id: v._id,
//         versionNumber: v.versionNumber,
//         updatedAt: v.updatedAt,
//         updatedBy: v.updatedBy,
//         isBaselined: v.isBaselined,
//         attachments: v.attachments,
//       })),
//     };

//     res.status(200).json(response);
//   } catch (err) {
//     console.error("Error in getDocumentById:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // 5. Get Version History
// exports.getVersionHistory = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const versions = await DocumentationVersion.find({ documentationId: id })
//       .sort({ versionNumber: -1 })
//       .populate("updatedBy", "name");

//     res.json(versions);
//   } catch (err) {
//     console.error("Error fetching version history:", err);
//     res.status(500).json({ message: "Failed to fetch version history" });
//   }
// };

// // 6. Restore Version
// exports.restoreVersion = async (req, res) => {
//   try {
//     const { versionId } = req.params;
//     const version = await DocumentationVersion.findById(versionId);
//     if (!version) return res.status(404).json({ message: "Version not found" });

//     const doc = await Documentation.findById(version.documentationId);
//     if (!doc) return res.status(404).json({ message: "Document not found" });

//     const newVersionNumber = doc.currentVersion + 1;

//     doc.content = version.content;
//     doc.attachments = version.attachments;
//     doc.currentVersion = newVersionNumber;
//     doc.updatedBy = req.user._id;
//     await doc.save();

//     await DocumentationVersion.create({
//       documentationId: doc._id,
//       versionNumber: newVersionNumber,
//       content: version.content,
//       attachments: version.attachments,
//       updatedBy: req.user._id,
//     });

//     res.json({ message: "Version restored successfully" });
//   } catch (err) {
//     console.error("Error restoring version:", err);
//     res.status(500).json({ message: "Failed to restore version" });
//   }
// };

// // 7. Delete Attachment from Version
// exports.deleteAttachment = async (req, res) => {
//   try {
//     const { versionId, filename } = req.params;
//     const version = await DocumentationVersion.findById(versionId);
//     if (!version) return res.status(404).json({ message: "Version not found" });

//     version.attachments = version.attachments.filter(a => a.filename !== filename);
//     await version.save();

//     // Optionally delete file from disk
//     const filePath = path.join(__dirname, "../", filename);
//     if (fs.existsSync(filePath)) {
//       fs.unlinkSync(filePath);
//     }

//     res.json({ message: "Attachment deleted successfully" });
//   } catch (err) {
//     console.error("Error deleting attachment:", err);
//     res.status(500).json({ message: "Failed to delete attachment" });
//   }
// };

// // 8. Set Baseline
// exports.setBaselineVersion = async (req, res) => {
//   const { versionId } = req.params;

//   try {
//     const version = await DocumentationVersion.findById(versionId);
//     if (!version) return res.status(404).json({ message: "Version not found" });

//     await DocumentationVersion.updateMany(
//       {
//         documentationId: version.documentationId,
//         isBaselined: true,
//         _id: { $ne: versionId },
//       },
//       { $set: { isBaselined: false } }
//     );

//     version.isBaselined = true;
//     await version.save();

//     res.json({ message: "Baseline version set successfully", version });
//   } catch (err) {
//     console.error("Error setting baseline:", err);
//     res.status(500).json({ message: "Failed to set baseline version" });
//   }
// };


const Documentation = require("../models/Documentation");
const DocumentationVersion = require("../models/DocumentationVersion");
const User = require("../models/User");
const Project = require("../models/Project");
const fs = require("fs");
const path = require("path");

const toArray = (v) => (Array.isArray(v) ? v : v != null ? [v] : []);


// Finds the next available version number by looking at the existing versions.
// const getNextVersionNumber = async (documentationId) => {
//   const latest = await DocumentationVersion
//     .findOne({ documentationId })
//     .sort({ versionNumber: -1 })
//     .select("versionNumber")
//     .lean();
//   return (latest?.versionNumber || 0) + 1;
// };

const getNextVersionNumber = async (documentationId) => {
  const latest = await DocumentationVersion
    .findOne({ documentationId })
    .sort({ versionNumber: -1 })
    .select("versionNumber")
    .lean();
  return (latest?.versionNumber || 0) + 1;
};

// Create a version document with a version number computed from the history.
// Retries once if we hit E11000 (concurrent writer just took that number).
// const createVersionWithRetry = async (payload, tries = 2) => {
//   while (tries > 0) {
//     try {
//       const nextVersion = await getNextVersionNumber(payload.documentationId);
//       return await DocumentationVersion.create({ ...payload, versionNumber: nextVersion });
//     } catch (err) {
//       // Duplicate on (documentationId, versionNumber) -> recompute and retry once
//       if (err?.code === 11000) {
//         tries -= 1;
//         if (tries === 0) throw err;
//       } else {
//         throw err;
//       }
//     }
//   }
// };

const createVersionWithRetry = async (payload, tries = 2) => {
  while (tries > 0) {
    try {
      const nextVersion = await getNextVersionNumber(payload.documentationId);
      return await DocumentationVersion.create({ ...payload, versionNumber: nextVersion });
    } catch (err) {
      if (err?.code === 11000) { // duplicate key on (documentationId, versionNumber)
        tries -= 1;
        if (tries === 0) throw err;
      } else {
        throw err;
      }
    }
  }
};


// 1. Create
// exports.createDocument = async (req, res) => {
//   try {
//     const { projectId, title, documentType, content } = req.body;
//     const files = (req.files || []);
//     const attachments = files.map(file => ({
//       filename: file.filename,
//       originalName: file.originalname,
//       size: file.size,
//       mimeType: file.mimetype,
//       filePath: file.path,
//     }));

//     const doc = await Documentation.create({
//       projectId, title, documentType, content, attachments,
//       currentVersion: 1,
//       createdBy: req.user._id,
//       updatedBy: req.user._id,
//     });

//     const v1 = await DocumentationVersion.create({
//       documentationId: doc._id,
//       versionNumber: 1,
//       title, documentType, projectId,
//       content, attachments,
//       updatedBy: req.user._id,
//       changeLog: [{ field: "init", oldValue: null, newValue: "v1 created" }],
//     });

//     doc.latestVersion = v1._id;
//     await doc.save();

//     res.status(201).json(doc);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Error creating document", error: err.message });
//   }
// };

exports.createDocument = async (req, res) => {
  try {
    const { projectId, title, documentType, content } = req.body;
    const files = (req.files || []);
    const attachments = files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
      filePath: file.path,
    }));

    const doc = await Documentation.create({
      projectId, title, documentType, content, attachments,
      currentVersion: 1,
      createdBy: req.user._id,
      updatedBy: req.user._id,
    });

    const v1 = await DocumentationVersion.create({
      documentationId: doc._id,
      versionNumber: 1,
      title, documentType, projectId,
      content, attachments,
      updatedBy: req.user._id,
      changeLog: [{ field: "init", oldValue: null, newValue: "v1 created" }],
    });

    doc.activeVersion = v1._id;   // <- now active
    await doc.save();

    res.status(201).json(doc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating document", error: err.message });
  }
};


// 2. Update → create new version (append-only)
// exports.updateDocument = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const userId = req.user._id;

//     const doc = await Documentation.findById(id);
//     if (!doc) return res.status(404).json({ message: "Document not found" });

//     // incoming fields
//     const newTitle = req.body.title ?? doc.title;
//     const newType = req.body.documentType ?? doc.documentType;
//     const newProjectId = req.body.projectId ?? String(doc.projectId);
//     const newContent = req.body.content ?? doc.content;

//     // attachments: keep old - removed + new
//     const removedIds = new Set(toArray(req.body.removedAttachments).map(String));
//     const prevAttachments = doc.attachments || [];
//     const keptOld = prevAttachments.filter(a => !removedIds.has(String(a._id)) && !removedIds.has(a.filename));

//     const newFiles = (req.files || []).map(file => ({
//       filename: file.filename,
//       originalName: file.originalname,
//       size: file.size,
//       mimeType: file.mimetype,
//       filePath: file.path,
//     }));

//     const mergedAttachments = [...keptOld, ...newFiles];

//     // changeLog
//     const changes = [];
//     if (newTitle !== doc.title) changes.push({ field: "title", oldValue: doc.title, newValue: newTitle });
//     if (newType !== doc.documentType) changes.push({ field: "documentType", oldValue: doc.documentType, newValue: newType });
//     if (String(newProjectId) !== String(doc.projectId)) changes.push({ field: "projectId", oldValue: doc.projectId, newValue: newProjectId });
//     if (newContent !== doc.content) changes.push({ field: "content", oldValue: "(omitted)", newValue: "(omitted)" });
//     if (removedIds.size || newFiles.length) {
//       changes.push({ field: "attachments", oldValue: `${prevAttachments.length} files`, newValue: `${mergedAttachments.length} files` });
//     }

//     const nextVersion = (doc.currentVersion || 1) + 1;

//     const version = await DocumentationVersion.create({
//       documentationId: doc._id,
//       versionNumber: nextVersion,
//       title: newTitle,
//       documentType: newType,
//       projectId: newProjectId,
//       content: newContent,
//       attachments: mergedAttachments,
//       updatedBy: userId,
//       isBaselined: false,
//       changeLog: changes,
//     });

//     // update document (latest snapshot)
//     doc.title = newTitle;
//     doc.documentType = newType;
//     doc.projectId = newProjectId;
//     doc.content = newContent;
//     doc.attachments = mergedAttachments;
//     doc.currentVersion = nextVersion;
//     doc.updatedBy = userId;
//     doc.latestVersion = version._id;
//     await doc.save();

//     res.status(200).json({ message: "Document updated and versioned successfully", versionNumber: nextVersion });
//   } catch (err) {
//     console.error("Update error", err);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

// exports.updateDocument = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const userId = req.user._id;

//     const doc = await Documentation.findById(id);
//     if (!doc) return res.status(404).json({ message: "Document not found" });

//     // Incoming fields (fallback to existing)
//     const newTitle = req.body.title ?? doc.title;
//     const newType = req.body.documentType ?? doc.documentType;
//     const newProjectId = req.body.projectId ?? String(doc.projectId);
//     const newContent = req.body.content ?? doc.content;

//     // Attachments merge: keep old - removed + new
//     const removedIds = new Set((Array.isArray(req.body.removedAttachments) ? req.body.removedAttachments : (req.body.removedAttachments ? [req.body.removedAttachments] : [])).map(String));
//     const prevAttachments = doc.attachments || [];
//     const keptOld = prevAttachments.filter(a => !removedIds.has(String(a._id)) && !removedIds.has(a.filename));

//     const newFiles = (req.files || []).map(file => ({
//       filename: file.filename,
//       originalName: file.originalname,
//       size: file.size,
//       mimeType: file.mimetype,
//       filePath: file.path,
//     }));

//     const mergedAttachments = [...keptOld, ...newFiles];

//     // Changes log
//     const changes = [];
//     if (newTitle !== doc.title) changes.push({ field: "title", oldValue: doc.title, newValue: newTitle });
//     if (newType !== doc.documentType) changes.push({ field: "documentType", oldValue: doc.documentType, newValue: newType });
//     if (String(newProjectId) !== String(doc.projectId)) changes.push({ field: "projectId", oldValue: doc.projectId, newValue: newProjectId });
//     if (newContent !== doc.content) changes.push({ field: "content", oldValue: "(omitted)", newValue: "(omitted)" });
//     if (newFiles.length || removedIds.size) {
//       changes.push({ field: "attachments", oldValue: `${prevAttachments.length} files`, newValue: `${mergedAttachments.length} files` });
//     }

//     // Create the new version using the next free version number
//     const version = await createVersionWithRetry({
//       documentationId: doc._id,
//       title: newTitle,
//       documentType: newType,
//       projectId: newProjectId,
//       content: newContent,
//       attachments: mergedAttachments,
//       updatedBy: userId,
//       isBaselined: false,
//       changeLog: changes,
//     });

//     // Sync the parent snapshot AFTER version creation
//     doc.title = newTitle;
//     doc.documentType = newType;
//     doc.projectId = newProjectId;
//     doc.content = newContent;
//     doc.attachments = mergedAttachments;
//     doc.currentVersion = version.versionNumber;   // trust the version we just created
//     doc.updatedBy = userId;
//     doc.latestVersion = version._id;
//     await doc.save();

//     res.status(200).json({ message: "Document updated and versioned successfully", versionNumber: version.versionNumber });
//   } catch (err) {
//     console.error("Update error", err);
//     res.status(500).json({ message: err?.message || "Internal server error" });
//   }
// };

exports.updateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const doc = await Documentation.findById(id);
    if (!doc) return res.status(404).json({ message: "Document not found" });

    const newTitle = req.body.title ?? doc.title;
    const newType = req.body.documentType ?? doc.documentType;
    const newProjectId = req.body.projectId ?? String(doc.projectId);
    const newContent = req.body.content ?? doc.content;

    const removed = new Set(
      (Array.isArray(req.body.removedAttachments) ? req.body.removedAttachments
        : (req.body.removedAttachments ? [req.body.removedAttachments] : [])
      ).map(String)
    );
    const prevAttachments = doc.attachments || [];
    const keptOld = prevAttachments.filter(a => !removed.has(String(a._id)) && !removed.has(a.filename));

    const newFiles = (req.files || []).map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
      filePath: file.path,
    }));

    const mergedAttachments = [...keptOld, ...newFiles];

    const changes = [];
    if (newTitle !== doc.title) changes.push({ field: "title", oldValue: doc.title, newValue: newTitle });
    if (newType !== doc.documentType) changes.push({ field: "documentType", oldValue: doc.documentType, newValue: newType });
    if (String(newProjectId) !== String(doc.projectId)) changes.push({ field: "projectId", oldValue: doc.projectId, newValue: newProjectId });
    if (newContent !== doc.content) changes.push({ field: "content", oldValue: "(omitted)", newValue: "(omitted)" });
    if (newFiles.length || removed.size) {
      changes.push({ field: "attachments", oldValue: `${prevAttachments.length} files`, newValue: `${mergedAttachments.length} files` });
    }

    const version = await createVersionWithRetry({
      documentationId: doc._id,
      title: newTitle,
      documentType: newType,
      projectId: newProjectId,
      content: newContent,
      attachments: mergedAttachments,
      updatedBy: userId,
      isBaselined: false,
      changeLog: changes,
    });

    // sync the doc to this newly active version
    doc.title = newTitle;
    doc.documentType = newType;
    doc.projectId = newProjectId;
    doc.content = newContent;
    doc.attachments = mergedAttachments;
    doc.currentVersion = version.versionNumber;
    doc.updatedBy = userId;
    doc.activeVersion = version._id; // <- important
    await doc.save();

    res.status(200).json({ message: "Document updated and versioned successfully", versionNumber: version.versionNumber });
  } catch (err) {
    console.error("Update error", err);
    res.status(500).json({ message: err?.message || "Internal server error" });
  }
};



// 3. List (unchanged except small guard)
// exports.getAllDocuments = async (req, res) => {
//   try {
//     const page = parseInt(req.query.page || "1", 10);
//     const limit = 10;
//     const skip = (page - 1) * limit;
//     const search = req.query.search || "";
//     const sortBy = req.query.sortBy || "createdAt";
//     const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

//     const query = {
//       $or: [
//         { title: { $regex: search, $options: "i" } },
//         { documentType: { $regex: search, $options: "i" } },
//       ],
//     };

//     const baseDocs = await Documentation.find(query)
//       .populate("projectId", "name")
//       .populate("createdBy", "name")
//       .sort({ [sortBy]: sortOrder })
//       .skip(skip)
//       .limit(limit)
//       .lean();

//     const docs = await Promise.all(
//       baseDocs.map(async (doc) => {
//         const latest = await DocumentationVersion.findOne({ documentationId: doc._id })
//           .populate("updatedBy", "name")
//           .sort({ versionNumber: -1 })
//           .lean();
//         return { ...doc, latestVersion: latest };
//       })
//     );

//     const total = await Documentation.countDocuments(query);
//     res.json({ documents: docs, totalPages: Math.ceil(total / limit) });
//   } catch (err) {
//     console.error("Error in getAllDocuments:", err);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

exports.getAllDocuments = async (req, res) => {
  try {
    const page = parseInt(req.query.page || "1", 10);
    const limit = 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || "";
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

    const query = {
      $or: [
        { title: { $regex: search, $options: "i" } },
        { documentType: { $regex: search, $options: "i" } },
      ],
    };

    const baseDocs = await Documentation.find(query)
      .populate("projectId", "name")
      .populate("createdBy", "name")
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean();

    const docs = await Promise.all(
      baseDocs.map(async (doc) => {
        let active = null;
        if (doc.activeVersion) {
          active = await DocumentationVersion.findById(doc.activeVersion)
            .populate("updatedBy", "name")
            .lean();
        } else {
          active = await DocumentationVersion.findOne({ documentationId: doc._id })
            .populate("updatedBy", "name")
            .sort({ versionNumber: -1 })
            .lean();
        }
        return { ...doc, activeVersion: active };
      })
    );

    const total = await Documentation.countDocuments(query);
    res.json({ documents: docs, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error("Error in getAllDocuments:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};


// 4. Details with history
// exports.getDocumentById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const doc = await Documentation.findById(id)
//       .populate("createdBy", "name")
//       .populate("updatedBy", "name")
//       .populate("projectId", "name");

//     if (!doc) return res.status(404).json({ message: "Document not found" });

//     const versions = await DocumentationVersion.find({ documentationId: id })
//       .sort({ versionNumber: -1 })
//       .populate("updatedBy", "name");

//     const latest = versions[0];

//     res.status(200).json({
//       _id: doc._id,
//       title: doc.title,
//       documentType: doc.documentType,
//       createdBy: doc.createdBy,
//       updatedBy: doc.updatedBy,
//       createdAt: doc.createdAt,
//       updatedAt: doc.updatedAt,
//       project: doc.projectId,
//       latestVersion: latest
//         ? {
//             versionNumber: latest.versionNumber,
//             updatedAt: latest.updatedAt,
//             updatedBy: latest.updatedBy,
//             isBaselined: latest.isBaselined,
//           }
//         : { versionNumber: doc.currentVersion },
//       content: latest?.content ?? doc.content,
//       attachments: latest?.attachments ?? doc.attachments ?? [],
//       versions: versions.map(v => ({
//         _id: v._id,
//         versionNumber: v.versionNumber,
//         updatedAt: v.updatedAt,
//         updatedBy: v.updatedBy,
//         isBaselined: v.isBaselined,
//         attachments: v.attachments,
//       })),
//     });
//   } catch (err) {
//     console.error("Error in getDocumentById:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

exports.getDocumentById = async (req, res) => {
  try {
    const { id } = req.params;

    const doc = await Documentation.findById(id)
      .populate("createdBy", "name")
      .populate("updatedBy", "name")
      .populate("projectId", "name")
      .populate("activeVersion"); // to have the populated version if set

    if (!doc) return res.status(404).json({ message: "Document not found" });

    const versions = await DocumentationVersion.find({ documentationId: id })
      .sort({ versionNumber: -1 })
      .populate("updatedBy", "name");

    // Prefer the active version; if missing (legacy), fall back to highest version
    let activeVersion = null;
    if (doc.activeVersion) {
      activeVersion = await DocumentationVersion.findById(doc.activeVersion)
        .populate("updatedBy", "name")
        .lean();
    }
    if (!activeVersion && versions.length) {
      activeVersion = versions[0];
    }

    res.status(200).json({
      _id: doc._id,
      title: doc.title,
      documentType: doc.documentType,
      createdBy: doc.createdBy,
      updatedBy: doc.updatedBy,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      project: doc.projectId,

      // expose the ACTIVE version meta
      activeVersion: activeVersion
        ? {
            _id: activeVersion._id,
            versionNumber: activeVersion.versionNumber,
            updatedAt: activeVersion.updatedAt,
            updatedBy: activeVersion.updatedBy,
            isBaselined: activeVersion.isBaselined,
          }
        : null,

      // content/attachments from the active snapshot (or doc snapshot)
      content: activeVersion?.content ?? doc.content,
      attachments: activeVersion?.attachments ?? doc.attachments ?? [],

      versions: versions.map(v => ({
        _id: v._id,
        versionNumber: v.versionNumber,
        updatedAt: v.updatedAt,
        updatedBy: v.updatedBy,
        isBaselined: v.isBaselined,
        attachments: v.attachments,
      })),
    });
  } catch (err) {
    console.error("Error in getDocumentById:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// 5. History (unchanged)
exports.getVersionHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const versions = await DocumentationVersion.find({ documentationId: id })
      .sort({ versionNumber: -1 })
      .populate("updatedBy", "name");
    res.json(versions);
  } catch (err) {
    console.error("Error fetching version history:", err);
    res.status(500).json({ message: "Failed to fetch version history" });
  }
};

// 5b. Get single version (for compare)
exports.getVersionById = async (req, res) => {
  try {
    const { versionId } = req.params;
    const v = await DocumentationVersion.findById(versionId)
      .populate("updatedBy","name")
      .populate("projectId","name")
      .lean();
    if (!v) return res.status(404).json({ message: "Version not found" });
    res.json(v);
  } catch (err) {
    console.error("Error getVersionById:", err);
    res.status(500).json({ message: "Failed to load version" });
  }
};

// 6. Restore (fixed param + full snapshot restore)
// exports.restoreVersion = async (req, res) => {
//   try {
//     const { id, version } = req.params; // route uses :version
//     const versionDoc = await DocumentationVersion.findById(version);
//     if (!versionDoc) return res.status(404).json({ message: "Version not found" });
//     if (String(versionDoc.documentationId) !== String(id)) {
//       return res.status(400).json({ message: "Version does not belong to this document" });
//     }

//     const doc = await Documentation.findById(id);
//     if (!doc) return res.status(404).json({ message: "Document not found" });

//     const newNumber = (doc.currentVersion || 1) + 1;

//     // create a *new* version that copies the chosen version’s snapshot
//     const restored = await DocumentationVersion.create({
//       documentationId: doc._id,
//       versionNumber: newNumber,
//       title: versionDoc.title,
//       documentType: versionDoc.documentType,
//       projectId: versionDoc.projectId,
//       content: versionDoc.content,
//       attachments: versionDoc.attachments,
//       updatedBy: req.user._id,
//       changeLog: [{ field: "restoreFrom", oldValue: doc.currentVersion, newValue: versionDoc.versionNumber }],
//     });

//     // update live doc to match restored snapshot
//     doc.title = versionDoc.title;
//     doc.documentType = versionDoc.documentType;
//     doc.projectId = versionDoc.projectId;
//     doc.content = versionDoc.content;
//     doc.attachments = versionDoc.attachments;
//     doc.currentVersion = newNumber;
//     doc.updatedBy = req.user._id;
//     doc.latestVersion = restored._id;
//     await doc.save();

//     res.json({ message: "Version restored successfully", versionNumber: newNumber });
//   } catch (err) {
//     console.error("Error restoring version:", err);
//     res.status(500).json({ message: "Failed to restore version" });
//   }
// };

// exports.restoreVersion = async (req, res) => {
//   try {
//     const { id, version } = req.params; // :id (doc id) and :version (version _id)
//     const versionDoc = await DocumentationVersion.findById(version);
//     if (!versionDoc) return res.status(404).json({ message: "Version not found" });
//     if (String(versionDoc.documentationId) !== String(id)) {
//       return res.status(400).json({ message: "Version does not belong to this document" });
//     }

//     const doc = await Documentation.findById(id);
//     if (!doc) return res.status(404).json({ message: "Document not found" });

//     // Create a new version that copies the chosen snapshot (next free number)
//     const restored = await createVersionWithRetry({
//       documentationId: doc._id,
//       title: versionDoc.title,
//       documentType: versionDoc.documentType,
//       projectId: versionDoc.projectId,
//       content: versionDoc.content,
//       attachments: versionDoc.attachments,
//       updatedBy: req.user._id,
//       changeLog: [{ field: "restoreFrom", oldValue: doc.currentVersion, newValue: versionDoc.versionNumber }],
//     });

//     // Update the live document to match restored snapshot
//     doc.title = versionDoc.title;
//     doc.documentType = versionDoc.documentType;
//     doc.projectId = versionDoc.projectId;
//     doc.content = versionDoc.content;
//     doc.attachments = versionDoc.attachments;
//     doc.currentVersion = restored.versionNumber;
//     doc.updatedBy = req.user._id;
//     doc.latestVersion = restored._id;
//     await doc.save();

//     res.json({ message: "Version restored successfully", versionNumber: restored.versionNumber });
//   } catch (err) {
//     console.error("Error restoring version:", err);
//     // surface duplicate meaningfully too
//     if (err?.code === 11000) {
//       return res.status(409).json({ message: "Retrying restore would succeed; a concurrent write just created that version number." });
//     }
//     res.status(500).json({ message: "Failed to restore version" });
//   }
// };

exports.restoreVersion = async (req, res) => {
  try {
    const { id, version } = req.params; // :id (doc id) and :version (version _id)
    const versionDoc = await DocumentationVersion.findById(version);
    if (!versionDoc) return res.status(404).json({ message: "Version not found" });
    if (String(versionDoc.documentationId) !== String(id)) {
      return res.status(400).json({ message: "Version does not belong to this document" });
    }

    const doc = await Documentation.findById(id);
    if (!doc) return res.status(404).json({ message: "Document not found" });

    // Switch ACTIVE snapshot to the chosen version (no new version created)
    doc.title = versionDoc.title;
    doc.documentType = versionDoc.documentType;
    doc.projectId = versionDoc.projectId;
    doc.content = versionDoc.content;
    doc.attachments = versionDoc.attachments;
    doc.currentVersion = versionDoc.versionNumber;   // rollback current version number to the chosen one
    doc.updatedBy = req.user._id;
    doc.activeVersion = versionDoc._id;
    await doc.save();

    res.json({ message: "Version restored successfully", activeVersion: versionDoc.versionNumber });
  } catch (err) {
    console.error("Error restoring version:", err);
    res.status(500).json({ message: "Failed to restore version" });
  }
};



// 7. Delete attachment FROM A VERSION (and sync doc if latest)
exports.deleteAttachment = async (req, res) => {
  try {
    const { versionId, filename } = req.params;
    const version = await DocumentationVersion.findById(versionId);
    if (!version) return res.status(404).json({ message: "Version not found" });

    const before = version.attachments.length;
    version.attachments = version.attachments.filter(a => a.filename !== filename);
    await version.save();

    // if this is the latest version, also sync the doc snapshot
    const doc = await Documentation.findById(version.documentationId);
    if (doc && String(doc.latestVersion) === String(version._id)) {
      doc.attachments = (doc.attachments || []).filter(a => a.filename !== filename);
      await doc.save();
    }

    // optional: delete from disk if stored locally
    // NOTE: we stored relative paths in filePath; adjust if needed
    // const filePath = path.resolve(version.attachments.find(a=>a.filename===filename)?.filePath || "");
    // if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);

    res.json({ message: `Attachment removed (${before - version.attachments.length} deleted)` });
  } catch (err) {
    console.error("Error deleting attachment:", err);
    res.status(500).json({ message: "Failed to delete attachment" });
  }
};

// 8. Baseline
exports.setBaselineVersion = async (req, res) => {
  const { versionId } = req.params;
  try {
    const version = await DocumentationVersion.findById(versionId);
    if (!version) return res.status(404).json({ message: "Version not found" });

    await DocumentationVersion.updateMany(
      { documentationId: version.documentationId, isBaselined: true, _id: { $ne: versionId } },
      { $set: { isBaselined: false } }
    );

    version.isBaselined = true;
    await version.save();

    res.json({ message: "Baseline version set successfully", version });
  } catch (err) {
    console.error("Error setting baseline:", err);
    res.status(500).json({ message: "Failed to set baseline version" });
  }
};
