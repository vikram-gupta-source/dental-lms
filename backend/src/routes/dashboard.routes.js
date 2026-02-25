const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const { getMyDashboard } = require("../controllers/dashboard.controller");

router.get("/me", auth, getMyDashboard);

module.exports = router;
