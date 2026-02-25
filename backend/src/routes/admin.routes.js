const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const allowRoles = require("../middleware/role.middleware");
const admin = require("../controllers/admin.controller");
const validateAdminUserUpdate = require("../middleware/validateAdminUserUpdate.middleware");
const validateAdminCreateUser = require("../middleware/validateAdminCreateUser.middleware");
const validateAdminAppointment = require("../middleware/validateAdminAppointment.middleware");

router.use(auth, allowRoles("admin"));

router.get("/dashboard", admin.getDashboard);
router.get("/users", admin.getUsers);
router.post("/users", validateAdminCreateUser, admin.createUser);
router.patch("/users/:id", validateAdminUserUpdate, admin.updateUser);
router.get("/appointments", admin.getAppointments);
router.post("/appointments", validateAdminAppointment, admin.createAppointment);
router.patch(
  "/appointments/:id",
  validateAdminAppointment,
  admin.updateAppointment,
);
router.get("/cases", admin.getAllCases);

module.exports = router;
