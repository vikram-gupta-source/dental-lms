const User = require("../models/User");

const roles = {
  ADMIN: "Admin",
  FACULTY: "Faculty",
  STUDENT: "Student",
  PATIENT: "Patient",
};

function allowRoles(...roles) {
  const normalized = roles.map((r) => String(r).toLowerCase());

  return (req, res, next) => {
    const userRole = String(req.user?.role || "").toLowerCase();
    if (!userRole || !normalized.includes(userRole)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
}

module.exports = allowRoles;
module.exports.allowRoles = allowRoles;
