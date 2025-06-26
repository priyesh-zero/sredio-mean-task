require("dotenv").config();
const cookieParser = require("cookie-parser");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const githubRoutes = require("./routes/githubRoutes");
const syncRoutes = require("./routes/syncRoutes");
const jobRoutes = require("./routes/jobRoutes");
const JobQueue = require("./services/JobQueue");

const app = express();
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(express.json());

const jobQueue = JobQueue.getInstance();

// Start the job queue when the app starts
jobQueue.start();

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("Shutting down job queue...");
  jobQueue.stop();
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));

app.use("/auth/github", githubRoutes);
app.use("/sync", syncRoutes);
app.use("/jobs", jobRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server running at http://localhost:${process.env.PORT}`);
});
