const Documentation = require("../models/Documentation");
const DocumentationVersion = require("../models/DocumentationVersion");
const User = require("../models/User");
const Project = require("../models/Project");
const fs = require("fs");
const path = require("path");

// 1. Create New Document (and initial version)
exports.createDocument = async (req, res) => {
  try {
    const { projectId, title, documentType, content } = req.body;
    const attachments = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
      filePath: file.path,
    }));

    const doc = await Documentation.create({
      projectId,
      title,
      documentType,
      content,
      attachments,
      createdBy: req.user._id,
      updatedBy: req.user._id,
    });

    await DocumentationVersion.create({
      documentationId: doc._id,
      versionNumber: 1,
      content,
      attachments,
      updatedBy: req.user._id,
    });

    res.status(201).json(doc);
  } catch (err) {
    res.status(500).json({ message: "Error creating document", error: err.message });
  }
};

// 2. Update Document (creates new version)
exports.updateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const existingDoc = await Documentation.findById(id).populate("projectId");
    if (!existingDoc) return res.status(404).json({ message: "Document not found" });

    // Compare fields for changelog
    const changes = [];
    if (req.body.title && req.body.title !== existingDoc.title)
      changes.push({ field: "title", oldValue: existingDoc.title, newValue: req.body.title });

    if (req.body.documentType && req.body.documentType !== existingDoc.documentType)
      changes.push({ field: "documentType", oldValue: existingDoc.documentType, newValue: req.body.documentType });

    if (req.body.projectId && req.body.projectId !== String(existingDoc.projectId))
      changes.push({ field: "projectId", oldValue: existingDoc.projectId, newValue: req.body.projectId });

    if (req.body.content && req.body.content !== existingDoc.content)
      changes.push({ field: "content", oldValue: "Previous content omitted", newValue: "New content omitted" });

    const versionCount = await DocumentationVersion.countDocuments({ documentationId: id });
    const attachments = req.files.map((file) => ({
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
      filePath: file.path,
    }));

    // Save new version
    const version = await DocumentationVersion.create({
      documentationId: id,
      versionNumber: versionCount + 1,
      content: req.body.content,
      attachments,
      updatedBy: userId,
      isBaselined: false,
      title: req.body.title || existingDoc.title,
      documentType: req.body.documentType || existingDoc.documentType,
      projectId: req.body.projectId || existingDoc.projectId,
      changeSummary: changes,
    });

    // Update main document
    existingDoc.title = req.body.title || existingDoc.title;
    existingDoc.documentType = req.body.documentType || existingDoc.documentType;
    existingDoc.projectId = req.body.projectId || existingDoc.projectId;
    existingDoc.content = req.body.content || existingDoc.content;
    existingDoc.updatedBy = userId;
    existingDoc.updatedAt = new Date();
    existingDoc.latestVersion = version._id;
    existingDoc.attachments = attachments;

    await existingDoc.save();

    res.status(200).json({ message: "Document updated and versioned successfully" });
  } catch (err) {
    console.error("Update error", err);
    res.status(500).json({ message: "Internal server error" });
  }
};


// 3. Get Paginated Documents (with latest version)
exports.getAllDocuments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
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

    const projectDocs = await Documentation.find(query)
      .populate("projectId", "name")
      .populate("createdBy", "name")
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean();

    const docsWithLatest = await Promise.all(
      projectDocs.map(async (doc) => {
        const latestVersion = await DocumentationVersion.findOne({
          documentationId: doc._id,
        })
          .populate("updatedBy", "name")
          .sort({ versionNumber: -1 })
          .lean();

        return { ...doc, latestVersion };
      })
    );

    const total = await Documentation.countDocuments(query);

    res.json({
      documents: docsWithLatest,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("Error in getAllDocuments:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// 4. Get Document Details with Version History
exports.getDocumentById = async (req, res) => {
  try {
    const { id } = req.params;

    const doc = await Documentation.findById(id)
      .populate("createdBy", "name")
      .populate("updatedBy", "name")
      .populate("projectId", "name");

    if (!doc) {
      return res.status(404).json({ message: "Document not found" });
    }

    const versions = await DocumentationVersion.find({ documentationId: id })
      .sort({ versionNumber: -1 })
      .populate("updatedBy", "name");

    const latestVersion = versions[0] || {};

    const response = {
      _id: doc._id,
      title: doc.title,
      documentType: doc.documentType,
      createdBy: doc.createdBy,
      updatedBy: doc.updatedBy,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      project: doc.projectId,
      latestVersion: {
        versionNumber: latestVersion.versionNumber,
        updatedAt: latestVersion.updatedAt,
        updatedBy: latestVersion.updatedBy,
        isBaselined: latestVersion.isBaselined,
      },
      content: latestVersion.content,
      attachments: latestVersion.attachments,
      versions: versions.map((v) => ({
        _id: v._id,
        versionNumber: v.versionNumber,
        updatedAt: v.updatedAt,
        updatedBy: v.updatedBy,
        isBaselined: v.isBaselined,
        attachments: v.attachments,
      })),
    };

    res.status(200).json(response);
  } catch (err) {
    console.error("Error in getDocumentById:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 5. Get Version History
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

// 6. Restore Version
exports.restoreVersion = async (req, res) => {
  try {
    const { versionId } = req.params;
    const version = await DocumentationVersion.findById(versionId);
    if (!version) return res.status(404).json({ message: "Version not found" });

    const doc = await Documentation.findById(version.documentationId);
    if (!doc) return res.status(404).json({ message: "Document not found" });

    const newVersionNumber = doc.currentVersion + 1;

    doc.content = version.content;
    doc.attachments = version.attachments;
    doc.currentVersion = newVersionNumber;
    doc.updatedBy = req.user._id;
    await doc.save();

    await DocumentationVersion.create({
      documentationId: doc._id,
      versionNumber: newVersionNumber,
      content: version.content,
      attachments: version.attachments,
      updatedBy: req.user._id,
    });

    res.json({ message: "Version restored successfully" });
  } catch (err) {
    console.error("Error restoring version:", err);
    res.status(500).json({ message: "Failed to restore version" });
  }
};

// 7. Delete Attachment from Version
exports.deleteAttachment = async (req, res) => {
  try {
    const { versionId, filename } = req.params;
    const version = await DocumentationVersion.findById(versionId);
    if (!version) return res.status(404).json({ message: "Version not found" });

    version.attachments = version.attachments.filter(a => a.filename !== filename);
    await version.save();

    // Optionally delete file from disk
    const filePath = path.join(__dirname, "../", filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({ message: "Attachment deleted successfully" });
  } catch (err) {
    console.error("Error deleting attachment:", err);
    res.status(500).json({ message: "Failed to delete attachment" });
  }
};

// 8. Set Baseline
exports.setBaselineVersion = async (req, res) => {
  const { versionId } = req.params;

  try {
    const version = await DocumentationVersion.findById(versionId);
    if (!version) return res.status(404).json({ message: "Version not found" });

    await DocumentationVersion.updateMany(
      {
        documentationId: version.documentationId,
        isBaselined: true,
        _id: { $ne: versionId },
      },
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
