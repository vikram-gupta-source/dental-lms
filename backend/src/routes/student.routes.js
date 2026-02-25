const express = require("express");
const router = express.Router();

const {
  getStudentCases,
  getStudentProcedureLog,
} = require("../controllers/student.controller");

// quick sanity check (remove later)
if (
  typeof getStudentCases !== "function" ||
  typeof getStudentProcedureLog !== "function"
) {
  throw new Error("student.controller exports are invalid");
}

router.get("/cases", getStudentCases);
router.get("/procedure-log", getStudentProcedureLog);

module.exports = router;
