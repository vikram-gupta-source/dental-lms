const CaseRecord = require("../models/CaseRecord");
const DigitalLogbook = require("../models/DigitalLogbook");
const ProcedureLog = require("../models/ProcedureLog");
const User = require("../models/User");
const Patient = require("../models/Patient");

const submitCase = async (req, res) => {
  try {
    const {
      patient,
      department,
      complaint,
      diagnosis,
      procedure,
      toothNo,
      notes,
      currentStructuredData,
      currentOriginalScanPdfUrl,
    } = req.body;

    if (!patient) {
      return res.status(400).json({ success: false, message: "patient is required" });
    }

    if (!department) {
      return res.status(400).json({ success: false, message: "department is required" });
    }

    const payload = {
      patient,
      department: String(department).trim(),
      complaint: complaint || "",
      diagnosis: diagnosis || "",
      procedure: procedure || "",
      toothNo: toothNo || "",
      notes: notes || "",
      currentStructuredData: currentStructuredData || {},
      currentOriginalScanPdfUrl: currentOriginalScanPdfUrl || "",
      assignedStudent: req.user.id,
      status: "Submitted",
      facultyApproved: false,
    };

    const created = await CaseRecord.create(payload);
    return res.status(201).json({ success: true, data: created });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const addLogbookEntry = async (req, res) => {
  try {
    const created = await DigitalLogbook.create({
      ...req.body,
      studentId: req.user.id,
      facultyApprovalStatus: "Pending",
    });
    return res.status(201).json({ success: true, data: created });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getMyCases = async (req, res) => {
  try {
    const data = await CaseRecord.find({ assignedStudent: req.user.id })
      .populate("patient", "name mrn phone")
      .populate("supervisor", "name department")
      .sort({ updatedAt: -1 });
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

async function getStudentCases(req, res) {
  try {
    const rows = await CaseRecord.find({ assignedStudent: req.user.id })
      .populate("patient", "name mrn")
      .sort({ updatedAt: -1 })
      .lean();
    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to fetch cases", error: error.message });
  }
}

async function updateMyCase(req, res) {
  try {
    const { id } = req.params;
    const {
      patient,
      department,
      complaint,
      diagnosis,
      procedure,
      toothNo,
      notes,
      currentStructuredData,
      currentOriginalScanPdfUrl,
      status,
    } = req.body;

    const doc = await CaseRecord.findOne({ _id: id, assignedStudent: req.user.id });
    if (!doc) {
      return res.status(404).json({ success: false, message: "Case not found" });
    }

    if (typeof patient !== "undefined") doc.patient = patient;
    if (typeof department !== "undefined") doc.department = String(department).trim();
    if (typeof complaint !== "undefined") doc.complaint = complaint;
    if (typeof diagnosis !== "undefined") doc.diagnosis = diagnosis;
    if (typeof procedure !== "undefined") doc.procedure = procedure;
    if (typeof toothNo !== "undefined") doc.toothNo = toothNo;
    if (typeof notes !== "undefined") doc.notes = notes;
    if (typeof currentStructuredData !== "undefined") {
      doc.currentStructuredData = currentStructuredData || {};
    }
    if (typeof currentOriginalScanPdfUrl !== "undefined") {
      doc.currentOriginalScanPdfUrl = currentOriginalScanPdfUrl || "";
    }
    if (["Draft", "Submitted"].includes(String(status || ""))) {
      doc.status = status;
    }

    await doc.save();
    return res.status(200).json({ success: true, data: doc });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

async function getPatientsForCases(req, res) {
  try {
    const rows = await Patient.find({})
      .select("name mrn department")
      .sort({ name: 1 })
      .lean();
    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to fetch patients", error: error.message });
  }
}

async function getStudentProcedureLog(req, res) {
  try {
    const rows = await DigitalLogbook.find({
      $or: [{ studentId: req.user.id }, { student: req.user.id }],
    })
      .sort({ createdAt: -1 })
      .lean();
    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to fetch procedure log", error: error.message });
  }
}

async function getMyProfile(req, res) {
  try {
    const doc = await User.findById(req.user.id).select("-password").lean();
    if (!doc) return res.status(404).json({ message: "User not found" });
    return res.status(200).json(doc);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to fetch profile", error: error.message });
  }
}

async function updateMyProfile(req, res) {
  try {
    const { name, phone, address, department, studentYear, rollNo } = req.body;
    const patch = {};

    if (typeof name !== "undefined") patch.name = name;
    if (typeof phone !== "undefined") patch.phone = phone;
    if (typeof address !== "undefined") patch.address = address;
    if (typeof department !== "undefined") patch.department = department;
    if (typeof studentYear !== "undefined") patch.studentYear = Number(studentYear) || 1;
    if (typeof rollNo !== "undefined") patch.rollNo = rollNo;

    const doc = await User.findByIdAndUpdate(req.user.id, patch, {
      new: true,
      runValidators: true,
    }).select("-password");
    if (!doc) return res.status(404).json({ message: "User not found" });

    return res.status(200).json(doc);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to update profile", error: error.message });
  }
}

async function getMyProcedureLogs(req, res) {
  try {
    const logs = await ProcedureLog.find({ studentId: req.user.id })
      .populate("patient", "name mrn")
      .sort({ date: -1 })
      .lean();
    return res.status(200).json({ success: true, data: logs });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch logs", error: error.message });
  }
}

async function createProcedureLog(req, res) {
  try {
    const { procedureType, patient, count, requiredQuota, notes } = req.body;

    if (!procedureType) {
      return res.status(400).json({ message: "Procedure type is required" });
    }

    const log = await ProcedureLog.create({
      studentId: req.user.id,
      procedureType,
      patient: patient || undefined,
      count: count || 1,
      requiredQuota: requiredQuota || 0,
      notes: notes || "",
    });

    return res.status(201).json({ success: true, data: log });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create log", error: error.message });
  }
}

async function updateProcedureLog(req, res) {
  try {
    const { id } = req.params;
    const { procedureType, patient, count, requiredQuota, notes } = req.body;

    const log = await ProcedureLog.findOne({ _id: id, studentId: req.user.id });
    if (!log) {
      return res.status(404).json({ message: "Log not found" });
    }

    if (typeof procedureType !== "undefined") log.procedureType = procedureType;
    if (typeof patient !== "undefined") log.patient = patient || undefined;
    if (typeof count !== "undefined") log.count = count;
    if (typeof requiredQuota !== "undefined") log.requiredQuota = requiredQuota;
    if (typeof notes !== "undefined") log.notes = notes;

    await log.save();
    return res.status(200).json({ success: true, data: log });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update log", error: error.message });
  }
}

async function deleteProcedureLog(req, res) {
  try {
    const { id } = req.params;
    const log = await ProcedureLog.findOneAndDelete({ _id: id, studentId: req.user.id });
    
    if (!log) {
      return res.status(404).json({ message: "Log not found" });
    }

    return res.status(200).json({ success: true, message: "Log deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete log", error: error.message });
  }
}

module.exports = {
  submitCase,
  addLogbookEntry,
  getMyCases,
  getStudentCases,
  updateMyCase,
  getPatientsForCases,
  getStudentProcedureLog,
  getMyProfile,
  updateMyProfile,
  getMyProcedureLogs,
  createProcedureLog,
  updateProcedureLog,
  deleteProcedureLog,
};
