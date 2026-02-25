const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth.middleware");
const authorizeModule = require("../middleware/authorize.middleware");
const authorize = authorizeModule.authorize || authorizeModule;

const appointments = require("../controllers/appointments.controller");

const roles = {
  ADMIN: "admin",
  FACULTY: "faculty",
  STUDENT: "student",
  PATIENT: "patient",
};

// fail-fast checks
if (typeof authorize !== "function")
  throw new Error("authorize middleware is invalid");
if (
  typeof appointments.getAppointments !== "function" ||
  typeof appointments.createAppointment !== "function"
) {
  throw new Error("appointments.controller exports are invalid");
}

router.get(
  "/",
  auth,
  authorize([roles.ADMIN, roles.FACULTY, roles.STUDENT, roles.PATIENT]),
  appointments.getAppointments,
);

router.post(
  "/",
  auth,
  authorize([roles.ADMIN, roles.FACULTY, roles.STUDENT, roles.PATIENT]),
  appointments.createAppointment,
);

module.exports = router;
