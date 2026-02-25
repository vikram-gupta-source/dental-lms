const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Appointment = require("../models/Appointment");
const CaseRecord = require("../models/CaseRecord");

const safeInt = (v, d) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : d;
};

const normalizeRole = (role) =>
  String(role || "")
    .trim()
    .toLowerCase();

const getDashboard = async (req, res) => {
  try {
    const [usersCount, appointmentsCount, casesCount, rolesAgg, caseStatusAgg] =
      await Promise.all([
        User.countDocuments(),
        Appointment.countDocuments(),
        CaseRecord.countDocuments(),
        User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]),
        CaseRecord.aggregate([
          { $group: { _id: "$status", count: { $sum: 1 } } },
        ]),
      ]);

    return res.status(200).json({
      usersCount,
      appointmentsCount,
      casesCount,
      usersByRole: rolesAgg,
      casesByStatus: caseStatusAgg,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to load dashboard", error: error.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const page = safeInt(req.query.page, 1);
    const limit = safeInt(req.query.limit, 20);
    const skip = (page - 1) * limit;

    const q = {};
    if (req.query.role) q.role = normalizeRole(req.query.role);
    if (req.query.email) q.email = { $regex: req.query.email, $options: "i" };

    const [items, total] = await Promise.all([
      User.find(q)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(q),
    ]);

    return res.status(200).json({
      items,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to fetch users", error: error.message });
  }
};

const createUser = async (req, res) => {
  try {
    const { name, fullName, email, password, role, isActive, department } =
      req.body;

    if (!email || !password || !role) {
      return res
        .status(400)
        .json({ message: "email, password, role are required" });
    }

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(409).json({ message: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);

    const normalizedRole = normalizeRole(role);

    const doc = await User.create({
      name: name || fullName,
      fullName: fullName || name,
      email: String(email).trim().toLowerCase(),
      password: hashed,
      role: normalizedRole,
      ...(normalizedRole === "faculty" || normalizedRole === "student"
        ? { department: department || "" }
        : {}),
      ...(typeof isActive === "boolean" ? { isActive } : {}),
    });

    const out = doc.toObject();
    delete out.password;

    return res.status(201).json(out);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to create user", error: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      fullName,
      role,
      isActive,
      password,
      department,
      phone,
      address,
      designation,
      experienceYears,
      studentYear,
      rollNo,
      guardianName,
      medicalNotes,
    } = req.body;

    const patch = {};

    if (typeof name !== "undefined") patch.name = name;
    if (typeof fullName !== "undefined") patch.fullName = fullName;
    if (typeof role !== "undefined")
      patch.role = String(role).toLowerCase().trim();
    if (typeof isActive !== "undefined") patch.isActive = !!isActive;
    if (typeof phone !== "undefined") patch.phone = phone;
    if (typeof address !== "undefined") patch.address = address;
    if (typeof password === "string" && password.trim()) {
      patch.password = await bcrypt.hash(password, 10);
    }

    const nextRole = patch.role || undefined;

    // role-specific editable fields
    if (
      ["faculty", "student"].includes(nextRole) &&
      typeof department !== "undefined"
    ) {
      patch.department = department;
    }

    if (nextRole === "faculty") {
      if (typeof designation !== "undefined") patch.designation = designation;
      if (typeof experienceYears !== "undefined")
        patch.experienceYears = Number(experienceYears) || 0;
      patch.studentYear = 0;
      patch.rollNo = "";
      patch.guardianName = "";
      patch.medicalNotes = "";
    } else if (nextRole === "student") {
      if (typeof studentYear !== "undefined")
        patch.studentYear = Number(studentYear) || 1;
      if (typeof rollNo !== "undefined") patch.rollNo = rollNo;
      patch.designation = "";
      patch.experienceYears = 0;
      patch.guardianName = "";
      patch.medicalNotes = "";
    } else if (nextRole === "patient") {
      if (typeof guardianName !== "undefined")
        patch.guardianName = guardianName;
      if (typeof medicalNotes !== "undefined")
        patch.medicalNotes = medicalNotes;
      patch.department = "";
      patch.designation = "";
      patch.experienceYears = 0;
      patch.studentYear = 0;
      patch.rollNo = "";
    } else if (nextRole === "admin") {
      patch.department = "";
      patch.designation = "";
      patch.experienceYears = 0;
      patch.studentYear = 0;
      patch.rollNo = "";
      patch.guardianName = "";
      patch.medicalNotes = "";
    }

    const doc = await User.findByIdAndUpdate(id, patch, {
      new: true,
      runValidators: true,
    }).select("-password");
    if (!doc) return res.status(404).json({ message: "User not found" });

    return res.status(200).json(doc);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to update user", error: error.message });
  }
};

const getAppointments = async (req, res) => {
  try {
    const page = safeInt(req.query.page, 1);
    const limit = safeInt(req.query.limit, 20);
    const skip = (page - 1) * limit;

    const q = {};
    if (req.query.status) q.status = req.query.status;
    if (req.query.department) q.department = req.query.department;

    const [items, total] = await Promise.all([
      Appointment.find(q).sort({ date: -1 }).skip(skip).limit(limit).lean(),
      Appointment.countDocuments(q),
    ]);

    return res.status(200).json({
      items,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to fetch appointments", error: error.message });
  }
};

const createAppointment = async (req, res) => {
  try {
    const { patient, date, department, chair, status } = req.body;

    if (!patient || !date || !department) {
      return res
        .status(400)
        .json({ message: "patient, date, department are required" });
    }

    const doc = await Appointment.create({
      patient,
      date,
      department,
      chair: chair || "",
      status: status || "Scheduled",
      createdBy: req.user?.id || req.user?._id || null,
    });

    return res.status(201).json(doc);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to create appointment", error: error.message });
  }
};

const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { patient, date, department, chair, status } = req.body;

    const patch = {};
    if (typeof patient !== "undefined") patch.patient = patient;
    if (typeof date !== "undefined") patch.date = date;
    if (typeof department !== "undefined") patch.department = department;
    if (typeof chair !== "undefined") patch.chair = chair;
    if (typeof status !== "undefined") patch.status = status;

    const doc = await Appointment.findByIdAndUpdate(id, patch, {
      new: true,
      runValidators: true,
    });

    if (!doc) return res.status(404).json({ message: "Appointment not found" });
    return res.status(200).json(doc);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update appointment",
      error: error.message,
    });
  }
};

const getAllCases = async (req, res) => {
  try {
    const page = safeInt(req.query.page, 1);
    const limit = safeInt(req.query.limit, 20);
    const skip = (page - 1) * limit;

    const q = {};
    if (req.query.status) q.status = req.query.status;
    if (req.query.department) q.department = req.query.department;

    const [items, total] = await Promise.all([
      CaseRecord.find(q).sort({ updatedAt: -1 }).skip(skip).limit(limit).lean(),
      CaseRecord.countDocuments(q),
    ]);

    return res.status(200).json({
      items,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to fetch cases", error: error.message });
  }
};

module.exports = {
  getDashboard,
  getUsers,
  createUser,
  updateUser,
  getAppointments,
  createAppointment,
  updateAppointment,
  getAllCases,
};
