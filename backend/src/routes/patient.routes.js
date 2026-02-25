const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth.middleware");
const authorize = require("../middleware/authorize.middleware");
const patientController = require("../controllers/patient.controller");

const roles = {
  ADMIN: "admin",
  FACULTY: "faculty",
  STUDENT: "student",
  PATIENT: "patient",
};

const { searchPatients, triageAndAssign } = patientController;

router.get(
  "/search",
  auth,
  authorize(["admin", "faculty", "student"]),
  searchPatients,
);
router.post(
  "/triage",
  auth,
  authorize([roles.ADMIN, roles.FACULTY]),
  triageAndAssign,
);

router.use(auth);
router.use(authorize("patient", "admin"));

router.get("/appointments", patientController.getMyAppointments);
router.post("/appointments", patientController.createMyAppointment);
router.patch(
  "/appointments/:id/reschedule",
  patientController.rescheduleMyAppointment,
);

router.patch("/profile", patientController.updateMyProfile);

module.exports = router;
