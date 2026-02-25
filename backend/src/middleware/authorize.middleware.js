module.exports = function authorize(...rolesOrArray) {
  const allowedRoles = Array.isArray(rolesOrArray[0])
    ? rolesOrArray[0]
    : rolesOrArray;
  const normalized = allowedRoles.map((r) => String(r).toLowerCase());

  return (req, res, next) => {
    const userRole = String(req.user?.role || "").toLowerCase();

    if (!userRole) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!normalized.includes(userRole)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    next();
  };
};
