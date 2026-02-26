const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const authorize = require("../middleware/authorize.middleware");

const {
  submitCase,
  getStudentCases,
  updateMyCase,
  getPatientsForCases,
  getStudentProcedureLog,
  getMyProfile,
  updateMyProfile,
  getMyProcedureLogs,
  createProcedureLog,
  updateProcedureLog,
  deleteProcedureLog,
} = require("../controllers/student.controller");

// quick sanity check (remove later)
if (
  typeof submitCase !== "function" ||
  typeof getStudentCases !== "function" ||
  typeof updateMyCase !== "function" ||
  typeof getPatientsForCases !== "function" ||
  typeof getStudentProcedureLog !== "function" ||
  typeof getMyProfile !== "function" ||
  typeof updateMyProfile !== "function"
) {
  throw new Error("student.controller exports are invalid");
}

router.use(auth);
router.use(authorize("student", "admin"));

router.get("/cases", getStudentCases);
router.post("/cases", submitCase);
router.patch("/cases/:id", updateMyCase);
router.get("/patients", getPatientsForCases);
router.get("/procedure-log", getStudentProcedureLog);
router.get("/profile", getMyProfile);
router.patch("/profile", updateMyProfile);

// New procedure log tracking endpoints
router.get("/logs", getMyProcedureLogs);
router.post("/logs", createProcedureLog);
router.patch("/logs/:id", updateProcedureLog);
router.delete("/logs/:id", deleteProcedureLog);

module.exports = router;
