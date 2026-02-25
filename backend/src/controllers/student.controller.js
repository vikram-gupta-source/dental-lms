const CaseRecord = require("../models/CaseRecord");
const DigitalLogbook = require("../models/DigitalLogbook");

const submitCase = async (req, res) => {
  try {
    const payload = {
      ...req.body,
      assignedStudent: req.user.id,
      status: "Submitted",
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
    const data = await CaseRecord.find({ assignedStudent: req.user.id }).sort({
      updatedAt: -1,
    });
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

async function getStudentCases(req, res) {
  try {
    const rows = await CaseRecord.find({}).lean();
    return res.status(200).json(rows);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to fetch cases", error: error.message });
  }
}

async function getStudentProcedureLog(req, res) {
  try {
    const rows = await DigitalLogbook.find({}).lean();
    return res.status(200).json(rows);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to fetch procedure log", error: error.message });
  }
}

module.exports = {
  submitCase,
  addLogbookEntry,
  getMyCases,
  getStudentCases,
  getStudentProcedureLog,
};
