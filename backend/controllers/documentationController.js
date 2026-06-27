const Documentation = require("../models/Documentation");
const DocumentationVersion = require("../models/DocumentationVersion");
const User = require("../models/User");
const Project = require("../models/Project");
const fs = require("fs");
const path = require("path");

const toArray = (v) => (Array.isArray(v) ? v : v != null ? [v] : []);


const getNextVersionNumber = async (documentationId) => {
  const latest = await DocumentationVersion
    .findOne({ documentationId })
    .sort({ versionNumber: -1 })
    .select("versionNumber")
    .lean();
  return (latest?.versionNumber || 0) + 1;
};

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
