const Appointment = require("../models/Appointment");

const createAppointment = async (req, res) => {
  try {
    const payload = { ...req.body, createdBy: req.user?.id };
    const appt = await Appointment.create(payload);
    return res.status(201).json({ success: true, data: appt });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getAppointments = async (req, res) => {
  try {
    const data = await Appointment.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createAppointment,
  getAppointments,
};
