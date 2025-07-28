const LessonsLearnedMaster = require("../models/LessonsLearnedMaster");

// Get all entries
exports.getAllLessons = async (req, res) => {
  try {
    const lessons = await LessonsLearnedMaster.find().sort({ createdAt: -1 });
    res.json(lessons);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch lessons", error: err.message });
  }
};

// Add new entry
exports.createLesson = async (req, res) => {
  try {
    const { name } = req.body;
    const existing = await LessonsLearnedMaster.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({ message: "Lesson already exists" });
    }

    const newLesson = new LessonsLearnedMaster({ name });
    await newLesson.save();
    res.status(201).json(newLesson);
  } catch (err) {
    res.status(500).json({ message: "Failed to create lesson", error: err.message });
  }
};

// Update entry
exports.updateLesson = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const updated = await LessonsLearnedMaster.findByIdAndUpdate(
      id,
      { name },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Failed to update lesson", error: err.message });
  }
};

// Delete entry
exports.deleteLesson = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await LessonsLearnedMaster.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    res.json({ message: "Lesson deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete lesson", error: err.message });
  }
};
