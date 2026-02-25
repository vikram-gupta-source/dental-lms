const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const ALLOWED_PUBLIC_ROLES = ["student", "faculty", "patient"];

const register = async (req, res) => {
  try {
    const { name, fullName, email, password } = req.body;
    let role = String(req.body.role || "patient")
      .trim()
      .toLowerCase();

    if (!ALLOWED_PUBLIC_ROLES.includes(role)) {
      role = "patient"; // block admin registration
    }

    const normalizedRole = String(role || "")
      .trim()
      .toLowerCase();

    if (!email || !password || !normalizedRole) {
      return res
        .status(400)
        .json({ message: "email, password, role are required" });
    }

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(409).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name || fullName,
      fullName: fullName || name,
      email: String(email).trim().toLowerCase(),
      password: hashedPassword,
      role,
    });

    return res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    return res.status(500).json({
      message: "Error registering user",
      error: error.message,
    });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "email and password are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "dev-secret",
      { expiresIn: "1h" },
    );

    return res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name || user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error logging in", error: error.message });
  }
};

module.exports = { register, login };
