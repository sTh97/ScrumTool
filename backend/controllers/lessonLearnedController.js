const LessonLearned = require("../models/LessonLearned");
const path = require("path");
const fs = require("fs");

// Create
exports.createLesson = async (req, res) => {
  try {
    const files = req.files?.slice(0, 3) || []; // Limit to 3
    const fileMetadata = files.map((file) => ({
      filename: file.filename,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: file.path,
    }));

    const lesson = new LessonLearned({
      ...req.body,
      files: fileMetadata,
    });

    await lesson.save();
    res.status(201).json(lesson);
  } catch (err) {
    console.error("Create Lesson Error:", err);
    res.status(500).json({ message: "Failed to create lesson", error: err.message });
  }
};

// Get All
// exports.getAllLessons = async (req, res) => {
//   try {
//     const lessons = await LessonLearned.find()
//       .populate("sprintId", "name")
//       .populate("projectId", "name")
//       .populate("epicId", "name")
//       .populate("author", "name")
//       .populate("contributors", "name")
//       .populate("phaseStageId", "name")
//       .populate("impactId", "name")
//       .populate("lessonsLearnedId", "name")
//       .populate("recommendationsId", "name")
//       .populate("prioritySeverityId", "name")
//       .populate("frequencyId", "name");

//     res.json(lessons);
//   } catch (err) {
//     res.status(500).json({ message: "Failed to fetch lessons", error: err.message });
//   }
// };

// exports.getAllLessons = async (req, res) => {
//   try {
//     const { page = 1, limit = 20, search = "" } = req.query;
//     const query = {
//       $or: [
//         { description: { $regex: search, $options: "i" } },
//         { rootCause: { $regex: search, $options: "i" } },
//         { actionsTaken: { $regex: search, $options: "i" } },
//       ],
//     };

//     const lessons = await LessonLearned.find(query)
//       .populate("sprintId", "name")
//       .populate("epicId", "name")
//       .populate("projectId", "name")
//       .populate("author", "name")
//       .populate("contributors", "name")
//       .populate("phaseStageId", "name")
//       .populate("impactId", "name")
//       .populate("lessonsLearnedId", "name")
//       .populate("recommendationsId", "name")
//       .populate("prioritySeverityId", "name")
//       .populate("frequencyId", "name")
//       .sort({ createdDate: -1 })
//       .skip((page - 1) * limit)
//       .limit(Number(limit));

//     const total = await LessonLearned.countDocuments(query);

//     res.json({ lessons, totalPages  });
//   } catch (err) {
//     res.status(500).json({ message: "Failed to fetch lessons", error: err.message });
//   }
// };


exports.getAllLessons = async (req, res) => {
  try {
    const { page = 1, limit = 40, search = "" } = req.query;

    const numericPage = Number(page);
    const numericLimit = Number(limit);

    const query = {
      $or: [
        { description: { $regex: search, $options: "i" } },
        { rootCause: { $regex: search, $options: "i" } },
        { actionsTaken: { $regex: search, $options: "i" } },
      ],
    };

    const total = await LessonLearned.countDocuments(query);
    const totalPages = Math.ceil(total / numericLimit);

    const lessons = await LessonLearned.find(query)
      .populate("sprintId", "name")
      .populate("epicId", "name")
      .populate("projectId", "name")
      .populate("author", "name")
      .populate("contributors", "name")
      .populate("phaseStageId", "name")
      .populate("impactId", "name")
      .populate("lessonsLearnedId", "name")
      .populate("recommendationsId", "name")
      .populate("prioritySeverityId", "name")
      .populate("frequencyId", "name")
      .sort({ createdDate: -1 })
      .skip((numericPage - 1) * numericLimit)
      .limit(numericLimit);

    res.json({ lessons, totalPages });
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch lessons",
      error: err.message,
    });
  }
};



// Get by ID
exports.getLessonById = async (req, res) => {
  try {
    const lesson = await LessonLearned.findById(req.params.id)
      .populate("sprintId projectId epicId author contributors phaseStageId impactId lessonsLearnedId recommendationsId prioritySeverityId frequencyId");

    if (!lesson) return res.status(404).json({ message: "Lesson not found" });

    res.json(lesson);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch lesson", error: err.message });
  }
};

// Update
exports.updateLesson = async (req, res) => {
  try {
    const files = req.files?.slice(0, 3) || [];
    const fileMetadata = files.map((file) => ({
      filename: file.filename,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: file.path,
    }));

    const updatedData = {
      ...req.body,
    };

    if (fileMetadata.length > 0) {
      updatedData.files = fileMetadata;
    }

    const updated = await LessonLearned.findByIdAndUpdate(req.params.id, updatedData, {
      new: true,
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Failed to update lesson", error: err.message });
  }
};

// Delete
exports.deleteLesson = async (req, res) => {
  try {
    const lesson = await LessonLearned.findById(req.params.id);
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });

    // Delete associated files from storage
    for (const file of lesson.files || []) {
      if (file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    }

    await LessonLearned.findByIdAndDelete(req.params.id);
    res.json({ message: "Lesson deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete lesson", error: err.message });
  }
};

//Download File

exports.downloadFile = (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, "../uploads/lesson-learned", filename);
  res.download(filePath, filename, (err) => {
    if (err) {
      res.status(404).json({ message: "File not found" });
    }
  });
};

//Delete File

exports.deleteFile = (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, "../uploads/lesson-learned", filename);

  fs.unlink(filePath, (err) => {
    if (err) {
      return res.status(500).json({ message: "Failed to delete file", error: err.message });
    }
    res.json({ message: "File deleted successfully" });
  });
};
