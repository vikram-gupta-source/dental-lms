const User = require("../models/User");
const Appointment = require("../models/Appointment");
const CaseRecord = require("../models/CaseRecord");
const DigitalLogbook = require("../models/DigitalLogbook"); // add this
const ProcedureLog = require("../models/ProcedureLog");
const QueueToken = require("../models/QueueToken");

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const todayRange = () => {
  const start = startOfToday();
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
};

const getMyDashboard = async (req, res) => {
  try {
    const role = String(req.user?.role || "").toLowerCase();
    const userId = req.user?.id || req.user?._id;

    if (role === "admin") {
      const { start, end } = todayRange();
      const [users, appointments, cases, activeQueue] = await Promise.all([
        User.countDocuments(),
        Appointment.countDocuments(),
        CaseRecord.countDocuments(),
        QueueToken.countDocuments({
          createdAt: { $gte: start, $lt: end },
          status: { $in: ["Waiting", "InProgress"] },
        }),
      ]);
      return res.json({
        title: "Admin Dashboard",
        cards: [
          {
            key: "opdQueue",
            label: "OPD Queue",
            value: activeQueue,
            route: "OPD Queue",
          },
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
      const facultyUser = await User.findById(userId).select("department").lean();
      const approvalsQuery = { status: "Submitted" };
      if (facultyUser?.department) approvalsQuery.department = facultyUser.department;

      const { start, end } = todayRange();

      const [assigned, approvals, myQueue] = await Promise.all([
        CaseRecord.countDocuments({ supervisor: userId }),
        CaseRecord.countDocuments(approvalsQuery),
        QueueToken.countDocuments({
          createdAt: { $gte: start, $lt: end },
          assignedFaculty: userId,
          status: { $in: ["Waiting", "InProgress"] },
        }),
      ]);
      return res.json({
        title: "Faculty Dashboard",
        cards: [
          {
            key: "myQueue",
            label: "Queue",
            value: myQueue,
            route: "Queue",
          },
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
      const { start, end } = todayRange();
      const [myCases, procedureLogs, legacyLogs, myQueue] = await Promise.all([
        CaseRecord.countDocuments({ assignedStudent: userId }),
        ProcedureLog.countDocuments({ studentId: userId }),
        DigitalLogbook.countDocuments({
          $or: [{ student: userId }, { studentId: userId }],
        }),
        QueueToken.countDocuments({
          createdAt: { $gte: start, $lt: end },
          assignedStudent: userId,
          status: { $in: ["Waiting", "InProgress"] },
        }),
      ]);

      const logs = procedureLogs + legacyLogs;

      return res.json({
        title: "Student Dashboard",
        cards: [
          {
            key: "myQueue",
            label: "Queue",
            value: myQueue,
            route: "Queue",
          },
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

    const { start, end } = todayRange();
    const [appts, myOpdTokens] = await Promise.all([
      Appointment.countDocuments({ patient: userId }),
      QueueToken.countDocuments({
        createdAt: { $gte: start, $lt: end },
        patientUser: userId,
        status: { $in: ["Waiting", "InProgress"] },
      }),
    ]);

    return res.json({
      title: "Patient Dashboard",
      cards: [
        {
          key: "opdToken",
          label: "OPD Token",
          value: myOpdTokens,
        },
        {
          key: "appointments",
          label: "Appointments",
          value: appts,
          route: "My Appointments",
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
