const Patient = require("../models/PatientProfile");
const User = require("../models/User");
const Appointment = require("../models/Appointment");

// GET /api/patients/search?mrn=&name=&department=
const searchPatients = async (req, res) => {
  try {
    const { mrn, name, department } = req.query;
    const q = {};
    if (mrn) q.mrn = new RegExp(mrn, "i");
    if (name) q.name = new RegExp(name, "i");
    if (department) q.department = department;

    const data = await Patient.find(q).limit(100);
    return res.status(200).json({ success: true, data });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

// POST /api/patients/triage
const triageAndAssign = async (req, res) => {
  try {
    // placeholder for triage logic
    return res.status(200).json({ success: true, message: "Triage assigned" });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

const getMyAppointments = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const now = new Date();

    const items = await Appointment.find({ patient: userId })
      .sort({ date: 1, createdAt: -1 })
      .lean();

    const upcoming = items.filter(
      (a) =>
        new Date(a.date) >= now &&
        a.status !== "Completed" &&
        a.status !== "Cancelled",
    );
    const history = items.filter((a) => !upcoming.includes(a));

    return res.status(200).json({ upcoming, history });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to fetch appointments", error: error.message });
  }
};

const createMyAppointment = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const { date, department, notes } = req.body;

    if (!date || !department) {
      return res
        .status(400)
        .json({ message: "date and department are required" });
    }

    const doc = await Appointment.create({
      patient: userId,
      date: new Date(date),
      department: String(department).trim(),
      notes: notes || "",
      status: "Scheduled",
      createdBy: userId,
    });

    return res.status(201).json(doc);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to create appointment", error: error.message });
  }
};

const rescheduleMyAppointment = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const { id } = req.params;
    const { date } = req.body;

    if (!date) return res.status(400).json({ message: "new date is required" });

    const appt = await Appointment.findOne({ _id: id, patient: userId });
    if (!appt)
      return res.status(404).json({ message: "Appointment not found" });

    if (["Completed", "Cancelled"].includes(appt.status)) {
      return res
        .status(400)
        .json({ message: "Cannot reschedule completed/cancelled appointment" });
    }

    appt.date = new Date(date);
    appt.status = "Scheduled";
    await appt.save();

    return res.status(200).json(appt);
  } catch (error) {
    return res
      .status(500)
      .json({
        message: "Failed to reschedule appointment",
        error: error.message,
      });
  }
};

const updateMyProfile = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const { fullName, phone, address, guardianName, medicalNotes } = req.body;

    const patch = {};
    if (typeof fullName !== "undefined") patch.fullName = fullName;
    if (typeof phone !== "undefined") patch.phone = phone;
    if (typeof address !== "undefined") patch.address = address;
    if (typeof guardianName !== "undefined") patch.guardianName = guardianName;
    if (typeof medicalNotes !== "undefined") patch.medicalNotes = medicalNotes;

    const doc = await User.findByIdAndUpdate(userId, patch, {
      new: true,
      runValidators: true,
    }).select("-password");
    return res.status(200).json(doc);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to update profile", error: error.message });
  }
};

module.exports = {
  searchPatients,
  triageAndAssign,
  getMyAppointments,
  createMyAppointment,
  rescheduleMyAppointment,
  updateMyProfile,
};
