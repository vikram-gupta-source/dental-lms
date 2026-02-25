const User = require("../models/User");
const Appointment = require("../models/Appointment");
const CaseRecord = require("../models/CaseRecord");
const DigitalLogbook = require("../models/DigitalLogbook"); // add this

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const getMyDashboard = async (req, res) => {
  try {
    const role = String(req.user?.role || "").toLowerCase();
    const userId = req.user?.id || req.user?._id;

    if (role === "admin") {
      const [users, appointments, cases] = await Promise.all([
        User.countDocuments(),
        Appointment.countDocuments(),
        CaseRecord.countDocuments(),
      ]);
      return res.json({
        title: "Admin Dashboard",
        cards: [
          { key: "users", label: "Users", value: users, route: "Users" },
          {
            key: "appointments",
            label: "Appointments",
            value: appointments,
            route: "Appointments",
          },
          { key: "cases", label: "Cases", value: cases, route: "Cases" },
        ],
      });
    }

    if (role === "faculty") {
      const [assigned, approvals] = await Promise.all([
        CaseRecord.countDocuments({ assignedFaculty: userId }),
        CaseRecord.countDocuments({
          assignedFaculty: userId,
          status: { $in: ["pending", "submitted"] },
        }),
      ]);
      return res.json({
        title: "Faculty Dashboard",
        cards: [
          {
            key: "assignedCases",
            label: "Assigned Cases",
            value: assigned,
            route: "Assigned Cases",
          },
          {
            key: "approvals",
            label: "Approvals",
            value: approvals,
            route: "Approvals",
          },
        ],
      });
    }

    if (role === "student") {
      const [myCases, logs] = await Promise.all([
        CaseRecord.countDocuments({ assignedStudent: userId }),
        DigitalLogbook.countDocuments({ student: userId }),
      ]);
      return res.json({
        title: "Student Dashboard",
        cards: [
          {
            key: "myCases",
            label: "My Cases",
            value: myCases,
            route: "My Cases",
          },
          {
            key: "procedureLog",
            label: "Procedure Log",
            value: logs,
            route: "Procedure Log",
          },
        ],
      });
    }

    const appts = await Appointment.countDocuments({ patient: userId });
    return res.json({
      title: "Patient Dashboard",
      cards: [
        {
          key: "appointments",
          label: "Appointments",
          value: appts,
          route: "Appointments",
        },
      ],
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to load dashboard", error: error.message });
  }
};

module.exports = { getMyDashboard };
