const ALLOWED_ROLES = ["admin", "faculty", "student", "patient"];

module.exports = function validateAdminCreateUser(req, res, next) {
  const b = req.body || {};
  const errors = [];

  const email = String(b.email || "").trim().toLowerCase();
  const password = String(b.password || "");
  const role = String(b.role || "").trim().toLowerCase();

  if (!email) errors.push("email is required");
  if (!password) errors.push("password is required");
  if (!role) errors.push("role is required");

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push("invalid email");
  if (password && password.length < 6) errors.push("password must be at least 6 characters");
  if (role && !ALLOWED_ROLES.includes(role)) errors.push("invalid role");

  if ((role === "faculty" || role === "student") && !String(b.department || "").trim()) {
    errors.push("department is required for faculty/student");
  }

  if (errors.length) return res.status(400).json({ message: "Validation failed", errors });

  req.body.email = email;
  req.body.role = role;
  next();
};