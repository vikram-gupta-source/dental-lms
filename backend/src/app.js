const express = require("express");
const cors = require("cors");

const app = express();

const adminRoutes = require("./routes/admin.routes");
const dashboardRoutes = require("./routes/dashboard.routes");

app.use(express.json());
app.use(cors({ origin: true, credentials: true }));

app.use((req, res, next) => {
  console.log(req.method, req.originalUrl, req.body);
  next();
});

app.get("/", (req, res) => {
  res.status(200).json({
    ok: true,
    message: "Dental API is running",
    health: "/api/health",
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({ ok: true });
});

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/admin", adminRoutes);
app.use("/api/patient", require("./routes/patient.routes"));
app.use("/api/student", require("./routes/student.routes"));
app.use("/api/faculty", require("./routes/faculty.routes"));
app.use("/api/appointments", require("./routes/appointments.routes"));
app.use("/api/dashboard", dashboardRoutes);

module.exports = app;
