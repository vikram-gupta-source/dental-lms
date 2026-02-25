const FacultyProfile = require("../models/FacultyProfile");
const CaseRecord = require("../models/CaseRecord");
const User = require("../models/User");

// Get all faculty profiles
exports.getAllFaculty = async (req, res) => {
  try {
    const faculty = await FacultyProfile.find();
    res.status(200).json(faculty);
  } catch (error) {
    res.status(500).json({ message: "Error fetching faculty profiles", error });
  }
};

// Get a single faculty profile by ID
exports.getFacultyById = async (req, res) => {
  try {
    const faculty = await FacultyProfile.findById(req.params.id);
    if (!faculty) {
      return res.status(404).json({ message: "Faculty not found" });
    }
    res.status(200).json(faculty);
  } catch (error) {
    res.status(500).json({ message: "Error fetching faculty profile", error });
  }
};

// Create a new faculty profile
exports.createFaculty = async (req, res) => {
  const { name, department, role } = req.body;
  const newFaculty = new FacultyProfile({ name, department, role });

  try {
    const savedFaculty = await newFaculty.save();
    res.status(201).json(savedFaculty);
  } catch (error) {
    res.status(500).json({ message: "Error creating faculty profile", error });
  }
};

// Update a faculty profile
exports.updateFaculty = async (req, res) => {
  try {
    const updatedFaculty = await FacultyProfile.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );
    if (!updatedFaculty) {
      return res.status(404).json({ message: "Faculty not found" });
    }
    res.status(200).json(updatedFaculty);
  } catch (error) {
    res.status(500).json({ message: "Error updating faculty profile", error });
  }
};

// Delete a faculty profile
exports.deleteFaculty = async (req, res) => {
  try {
    const deletedFaculty = await FacultyProfile.findByIdAndDelete(
      req.params.id,
    );
    if (!deletedFaculty) {
      return res.status(404).json({ message: "Faculty not found" });
    }
    res.status(200).json({ message: "Faculty profile deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting faculty profile", error });
  }
};

// GET /api/faculty/approval-queue
const getApprovalQueue = async (req, res) => {
  try {
    const faculty = await User.findById(req.user.id).select("department").lean();
    const query = { status: "Submitted" };
    if (faculty?.department) query.department = faculty.department;

    const data = await CaseRecord.find(query)
      .populate("assignedStudent", "name email")
      .populate("patient", "name mrn phone")
      .populate("supervisor", "name department")
      .sort({ updatedAt: -1 });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/faculty/cases/:id/approve
const approveCase = async (req, res) => {
  try {
    const updated = await CaseRecord.findByIdAndUpdate(
      req.params.id,
      { status: "Approved", supervisor: req.user.id },
      { new: true },
    );

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Case not found" });
    }

    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/faculty/cases/:id/status
const updateCaseStatus = async (req, res) => {
  try {
    const allowedStatuses = ["Approved", "Rejected", "Referred"];
    const nextStatus = String(req.body?.status || "").trim();

    if (!allowedStatuses.includes(nextStatus)) {
      return res.status(400).json({
        success: false,
        message: `status must be one of: ${allowedStatuses.join(", ")}`,
      });
    }

    const update = { status: nextStatus, supervisor: req.user.id };
    if (nextStatus === "Referred") {
      const departments = Array.isArray(req.body?.referredToDepartments)
        ? req.body.referredToDepartments.filter(Boolean)
        : [];
      update.referredToDepartments = departments;
    }

    const updated = await CaseRecord.findByIdAndUpdate(req.params.id, update, {
      new: true,
    });

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Case not found" });
    }

    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/faculty/dashboard
const getDashboard = async (req, res) => {
  return res
    .status(200)
    .json({ ok: true, module: "faculty", screen: "dashboard" });
};

// GET /api/faculty/cases
const getCases = async (req, res) => {
  try {
    const data = await CaseRecord.find({ supervisor: req.user.id })
      .populate("assignedStudent", "name email")
      .populate("patient", "name mrn phone")
      .populate("supervisor", "name department")
      .sort({ updatedAt: -1 });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getApprovalQueue,
  approveCase,
  updateCaseStatus,
  getDashboard,
  getCases,
};
