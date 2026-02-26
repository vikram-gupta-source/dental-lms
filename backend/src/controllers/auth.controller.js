const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const env = require("../config/env");

const ALLOWED_PUBLIC_ROLES = ["student", "faculty", "patient"];

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

const register = async (req, res) => {
  try {
    const { name, fullName, email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);
    let role = String(req.body.role || "patient")
      .trim()
      .toLowerCase();

    if (!ALLOWED_PUBLIC_ROLES.includes(role)) {
      role = "patient"; // block admin registration
    }

    const normalizedRole = String(role || "")
      .trim()
      .toLowerCase();

    if (!normalizedEmail || !password || !normalizedRole) {
      return res
        .status(400)
        .json({ message: "email, password, role are required" });
    }

    if (String(password).length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing)
      return res.status(409).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name || fullName,
      fullName: fullName || name,
      email: normalizedEmail,
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
  const { password } = req.body;
  const normalizedEmail = normalizeEmail(req.body.email);

  if (!normalizedEmail || !password) {
    return res.status(400).json({ message: "email and password are required" });
  }

  try {
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    if (user.isActive === false) {
      return res.status(403).json({ message: "Account is inactive" });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      env.JWT_SECRET,
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

const me = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const user = await User.findById(userId).select(
      "_id name email role isActive",
    );

    if (!user || user.isActive === false) {
      return res.status(401).json({ message: "Invalid token" });
    }

    return res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to fetch user", error: error.message });
  }
};

module.exports = { register, login, me };
