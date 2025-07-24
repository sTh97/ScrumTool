// File: controllers/userStoryController.js

const UserStory = require("../models/UserStory");

// Create User Story
exports.createUserStory = async (req, res) => {
  try {
    const newStory = new UserStory(req.body);
    await newStory.save();
    res.status(201).json(newStory);
  } catch (err) {
    res.status(500).json({ message: "Error creating user story", error: err.message });
  }
};

// Get all user stories
exports.getAllUserStories = async (req, res) => {
  try {
    const stories = await UserStory.find();
    res.json(stories);
  } catch (err) {
    res.status(500).json({ message: "Error fetching user stories" });
  }
};

// Get user story by ID
exports.getUserStoryById = async (req, res) => {
  try {
    const story = await UserStory.findById(req.params.id);
    if (!story) return res.status(404).json({ message: "User story not found" });
    res.json(story);
  } catch (err) {
    res.status(500).json({ message: "Error fetching user story" });
  }
};

// Update user story
exports.updateUserStory = async (req, res) => {
  try {
    const story = await UserStory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!story) return res.status(404).json({ message: "User story not found" });
    res.json(story);
  } catch (err) {
    res.status(500).json({ message: "Error updating user story" });
  }
};

// Delete user story
exports.deleteUserStory = async (req, res) => {
  try {
    await UserStory.findByIdAndDelete(req.params.id);
    res.json({ message: "User story deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting user story" });
  }
};
