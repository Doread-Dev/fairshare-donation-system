const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();

const app = express();
const authRouter = require("./routes/auth");
const usersRouter = require("./routes/users");
const materialsRouter = require("./routes/materials");
const donationsRouter = require("./routes/donations");
const familiesRouter = require("./routes/families");
const distributionRouter = require("./routes/distribution");
const reportsRouter = require("./routes/reports");
const settingsRouter = require("./routes/settings");
const notificationsRouter = require("./routes/notifications");
const dashboardRouter = require("./routes/dashboard");

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: process.env.CORS_ORIGINS?.split(",") || "*",
    credentials: true,
  })
);
app.use(morgan(process.env.LOG_LEVEL || "dev"));
app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/materials", materialsRouter);
app.use("/api/donations", donationsRouter);
app.use("/api/families", familiesRouter);
app.use("/api/distribution", distributionRouter);
app.use("/api/reports", reportsRouter);
app.use("/api/settings", settingsRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/dashboard", dashboardRouter);
// Health check route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "FairShare backend is running." });
});


module.exports = app;
