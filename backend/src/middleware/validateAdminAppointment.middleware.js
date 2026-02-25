const ALLOWED_STATUS = ["Scheduled", "Completed", "Cancelled", "Pending"];

module.exports = function validateAdminAppointment(req, res, next) {
  const b = req.body || {};
  const errors = [];

  const isCreate = req.method === "POST";

  if (isCreate) {
    if (!b.patient) errors.push("patient is required");
    if (!b.date) errors.push("date is required");
    if (!b.department) errors.push("department is required");
  }

  if (typeof b.date !== "undefined" && Number.isNaN(new Date(b.date).getTime())) {
    errors.push("invalid date");
  }

  if (typeof b.status !== "undefined" && !ALLOWED_STATUS.includes(String(b.status))) {
    errors.push(`status must be one of: ${ALLOWED_STATUS.join(", ")}`);
  }

  if (errors.length) return res.status(400).json({ message: "Validation failed", errors });
  next();
};