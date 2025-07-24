const express = require("express");
const cors = require("cors");
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