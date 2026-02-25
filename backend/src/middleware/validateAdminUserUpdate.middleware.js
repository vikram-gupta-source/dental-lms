function isNonEmptyString(v) {
  return typeof v === "string" && v.trim().length > 0;
}

module.exports = function validateAdminUserUpdate(req, res, next) {
  const b = req.body || {};
  const errors = [];

  if (typeof b.role !== "undefined") {
    b.role = String(b.role).toLowerCase().trim();
    if (!["admin", "faculty", "student", "patient"].includes(b.role)) {
      errors.push("Invalid role");
    }
  }

  if (typeof b.email !== "undefined") {
    errors.push("Email cannot be changed from this endpoint");
  }

  if (
    typeof b.password !== "undefined" &&
    String(b.password).trim().length < 6
  ) {
    errors.push("Password must be at least 6 characters");
  }

  const role = b.role;

  // Faculty
  if (role === "faculty") {
    if (!isNonEmptyString(b.department))
      errors.push("Department is required for faculty");
    if (
      typeof b.experienceYears !== "undefined" &&
      Number(b.experienceYears) < 0
    ) {
      errors.push("experienceYears must be >= 0");
    }
  }

  // Student
  if (role === "student") {
    if (!isNonEmptyString(b.department))
      errors.push("Department is required for student");
    if (typeof b.studentYear !== "undefined") {
      const y = Number(b.studentYear);
      if (!Number.isInteger(y) || y < 1 || y > 6)
        errors.push("studentYear must be between 1 and 6");
    }
  }

  // Patient
  if (role === "patient") {
    if (
      typeof b.guardianName !== "undefined" &&
      !isNonEmptyString(b.guardianName)
    ) {
      errors.push("guardianName cannot be empty");
    }
  }

  if (errors.length) {
    return res.status(400).json({ message: "Validation failed", errors });
  }

  req.body = b;
  next();
};
