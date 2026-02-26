const express = require("express");
const router = express.Router();
const { login, register, me } = require("../controllers/auth.controller");
const auth = require("../middleware/auth.middleware");

router.post("/login", login);
router.post("/register", register);
router.get("/me", auth, me);

module.exports = router;
