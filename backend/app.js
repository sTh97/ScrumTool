// const express = require("express");
// const cors = require("cors");
// const path = require("path");
// const mongoose = require("mongoose");
// const dotenv = require("dotenv");
// // const swaggerUi = require('swagger-ui-express');
// // const swaggerSpec = require('./config/swaggerConfig');
// const authRoutes = require("./routes/authRoutes");
// const roleRoutes = require("./routes/roleRoutes");
// const userRoutes = require("./routes/userRoutes");
// const seedAdmin = require("./utils/seedAdmin");
// const projectRoutes = require("./routes/projectRoutes");
// const epic = require("./routes/epicRoutes")
// const sprintRoutes = require("./routes/sprintRoutes");
// const estimationRoutes = require("./routes/estimationRoutes");
// const userStoryRoutes = require("./routes/userStoryRoutes");
// const dashboardRoutes = require("./routes/dashboardRoutes");
// const taskRoutes = require("./routes/taskRoutes");
// const phaseStageRoutes = require("./routes/phaseStageRoutes")
// const impactRoutes = require("./routes/impactRoutes");
// const lessonsLearnedRoutes = require("./routes/lessonsLearnedMasterRoutes");
// const recommendationsRoutes = require("./routes/recommendationsMasterRoutes");
// const prioritySeverityRoutes = require("./routes/prioritySeverityRoutes");
// const frequencyRoutes = require("./routes/frequencyRoutes");
// const lessonLearnedRoutes = require("./routes/lessonLearnedRoutes");
// const documentationRoutes = require('./routes/documentationRoutes');
// const otherTaskTypesRoutes = require("./routes/otherTaskTypes.routes");
// const otherTasksRoutes = require("./routes/otherTasks.routes");



// const allowedOrigins = ['http://api.al.3em.tech', 'http://al.3em.tech', 'http://localhost:3000', 'http://localhost:5000'];




// dotenv.config();
// const app = express();

// // Middleware
// app.use(cors({
//   origin: function (origin, callback) {
//     // Allow requests with no origin (like mobile apps or curl)
//     if (!origin) return callback(null, true);
//     if (allowedOrigins.includes(origin)) {
//       return callback(null, true);
//     } else {
//       return callback(new Error('Not allowed by CORS'));
//     }
//   },
//   credentials: true,
// }));

// app.use(express.json());

// // Routes
// app.use("/api/dashboard", dashboardRoutes);
// app.use("/api/auth", authRoutes);
// app.use("/api/roles", roleRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/projects", projectRoutes);
// app.use("/api/epics", epic);
// app.use("/api/sprints", sprintRoutes);
// app.use("/api/estimations", estimationRoutes);
// app.use("/api/userstories", userStoryRoutes);
// app.use("/api/tasks", taskRoutes);
// app.use("/api/phase-stage", phaseStageRoutes);
// app.use("/api/impact", impactRoutes);
// app.use("/api/lessons-learned", lessonsLearnedRoutes);
// app.use("/api/recommendations", recommendationsRoutes);
// app.use("/api/priority-severity", prioritySeverityRoutes);
// app.use("/api/frequency", frequencyRoutes);
// app.use("/api/lesson-learned", lessonLearnedRoutes);
// app.use('/api/docs', documentationRoutes);
// app.use("/api/other-task-types", otherTaskTypesRoutes);
// app.use("/api/other-tasks", otherTasksRoutes);

// // app.use("/uploads", express.static("uploads"));
// app.use("/uploads/lesson-files", express.static(path.join(__dirname, "uploads/lesson-files")));
// app.use("/uploads/docs", express.static(path.join(__dirname, "uploads/docs")));


// // Enable Swagger UI
// // app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// // DB Connection
// mongoose
//   .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(async () => {
//     console.log("MongoDB Connected");
//     await seedAdmin();
//     const port = process.env.PORT || 5000;
//     app.listen(port, () => console.log(`Server running on port ${port}`));
//   })
//   .catch((err) => console.error("MongoDB connection error:", err));


//**********************Updated App.js************************************************* */

const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

// ★ ADDED: HTTP server + Socket.IO
const http = require("http");
const { Server } = require("socket.io");

// const swaggerUi = require('swagger-ui-express');
// const swaggerSpec = require('./config/swaggerConfig');
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
const documentationRoutes = require('./routes/documentationRoutes');
const otherTaskTypesRoutes = require("./routes/otherTaskTypes.routes");
const otherTasksRoutes = require("./routes/otherTasks.routes");

// ★ ADDED: Chat routes + socket handlers
const chatRoutes = require("./routes/chatRoutes");
const attachChatSockets = require("./sockets/chat");

const allowedOrigins = ['http://api.al.3em.tech', 'http://al.3em.tech', 'http://localhost:3000', 'http://localhost:5000'];

dotenv.config();
const app = express();

// ★ ADDED: create HTTP server + Socket.IO instance early so we can attach to req later
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  }
});

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json());

// ★ ADDED: expose io to controllers (e.g., chatController uses req.io.emit)
app.use((req, _res, next) => { req.io = io; next(); });

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
app.use('/api/docs', documentationRoutes);
app.use("/api/other-task-types", otherTaskTypesRoutes);
app.use("/api/other-tasks", otherTasksRoutes);

// ★ ADDED: Chat API mount (kept at the end of your current route block)
app.use("/api/chat", chatRoutes);

// app.use("/uploads", express.static("uploads"));
app.use("/uploads/lesson-files", express.static(path.join(__dirname, "uploads/lesson-files")));
app.use("/uploads/docs", express.static(path.join(__dirname, "uploads/docs")));

// Enable Swagger UI
// app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// DB Connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log("MongoDB Connected");
    await seedAdmin();

    // ★ ADDED: attach socket event handlers after DB is ready
    attachChatSockets(io);

    const port = process.env.PORT || 5000;

    // ★ CHANGED: use server.listen (not app.listen) so Socket.IO works
    server.listen(port, () => console.log(`Server running on port ${port}`));
  })
  .catch((err) => console.error("MongoDB connection error:", err));
