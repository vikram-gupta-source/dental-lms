const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth.middleware");
const authorizeModule = require("../middleware/authorize.middleware");
const authorize = authorizeModule.authorize || authorizeModule;

const faculty = require("../controllers/faculty.controller");

const roles = { ADMIN: "admin", FACULTY: "faculty" };

// fail fast if import is wrong
if (
  typeof faculty.getDashboard !== "function" ||
  typeof faculty.getCases !== "function"
) {
  throw new Error("faculty.controller exports are invalid");
}

router.get(
  "/dashboard",
  auth,
  authorize([roles.FACULTY, roles.ADMIN]),
  faculty.getDashboard,
);
router.get(
  "/cases",
  auth,
  authorize([roles.FACULTY, roles.ADMIN]),
  faculty.getCases,
);

module.exports = router;
