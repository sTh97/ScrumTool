// File: seed/estimationSeeder.js

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Estimation = require("../models/Estimation");

dotenv.config();

const seedEstimation = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    // Clear existing estimations (optional based on use case)
    // await Estimation.deleteMany();

    console.log("Estimation seeder ready. No default data added. Frontend will handle user-defined sizes.");
    process.exit();
  } catch (err) {
    console.error("Failed to initialize estimation seeder:", err);
    process.exit(1);
  }
};

seedEstimation();
