const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const authRoutes = require("./routes/authRoutes");
const roleRoutes = require("./routes/roleRoutes");
const userRoutes = require("./routes/userRoutes");
const seedAdmin = require("./utils/seedAdmin");
const projectRoutes = require("./routes/projectRoutes");
const epic = require("./routes/epicRoutes")
const sprintRoutes = require("./routes/sprintRoutes");
const estimationRoutes = require("./routes/estimationRoutes");
const userStoryRoutes = require("./routes/userStoryRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const taskRoutes = require("./routes/taskRoutes");
const phaseStageRoutes = require("./routes/phaseStageRoutes")
const impactRoutes = require("./routes/impactRoutes");
const lessonsLearnedRoutes = require("./routes/lessonsLearnedMasterRoutes");
const recommendationsRoutes = require("./routes/recommendationsMasterRoutes");
const prioritySeverityRoutes = require("./routes/prioritySeverityRoutes");
const frequencyRoutes = require("./routes/frequencyRoutes");
const lessonLearnedRoutes = require("./routes/lessonLearnedRoutes");






dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/epics", epic);
app.use("/api/sprints", sprintRoutes);
app.use("/api/estimations", estimationRoutes);
app.use("/api/userstories", userStoryRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/phase-stage", phaseStageRoutes);
app.use("/api/impact", impactRoutes);
app.use("/api/lessons-learned", lessonsLearnedRoutes);
app.use("/api/recommendations", recommendationsRoutes);
app.use("/api/priority-severity", prioritySeverityRoutes);
app.use("/api/frequency", frequencyRoutes);
app.use("/api/lesson-learned", lessonLearnedRoutes);
// app.use("/uploads", express.static("uploads"));
app.use("/uploads/lesson-files", express.static(path.join(__dirname, "uploads/lesson-files")));


// DB Connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log("MongoDB Connected");
    await seedAdmin();
    const port = process.env.PORT || 5000;
    app.listen(port, () => console.log(`Server running on port ${port}`));
  })
  .catch((err) => console.error("MongoDB connection error:", err));