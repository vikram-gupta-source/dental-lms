const QueueToken = require("../models/QueueToken");
const User = require("../models/User");

const ACTIVE_STATUSES = ["Waiting", "InProgress"];
const ALLOWED_UPDATE_STATUSES = [
  "Waiting",
  "InProgress",
  "Completed",
  "Cancelled",
];

const todayRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
};

const pickLeastLoadedUser = async ({ role, department }) => {
  const users = await User.find({
    role,
    isActive: true,
    ...(department ? { department } : {}),
  })
    .select("_id")
    .lean();

  if (!users.length) return null;

  const { start, end } = todayRange();
  const grouped = await QueueToken.aggregate([
    {
      $match: {
        status: { $in: ACTIVE_STATUSES },
        createdAt: { $gte: start, $lt: end },
        ...(department ? { department } : {}),
      },
    },
    {
      $group: {
        _id: role === "student" ? "$assignedStudent" : "$assignedFaculty",
        count: { $sum: 1 },
      },
    },
  ]);

  const counts = new Map(
    grouped
      .filter((row) => row?._id)
      .map((row) => [String(row._id), Number(row.count || 0)]),
  );

  users.sort((a, b) => {
    const left = counts.get(String(a._id)) || 0;
    const right = counts.get(String(b._id)) || 0;
    return left - right;
  });

  return users[0]?._id || null;
};

const pickChair = async ({ department, requestedChair }) => {
  if (requestedChair) return String(requestedChair).trim();

  const chairs = ["Chair-1", "Chair-2", "Chair-3", "Chair-4", "Chair-5"];
  const { start, end } = todayRange();

  const grouped = await QueueToken.aggregate([
    {
      $match: {
        status: { $in: ACTIVE_STATUSES },
        createdAt: { $gte: start, $lt: end },
        department,
      },
    },
    { $group: { _id: "$chair", count: { $sum: 1 } } },
  ]);

  const counts = new Map(
    grouped
      .filter((row) => row?._id)
      .map((row) => [String(row._id), Number(row.count || 0)]),
  );

  chairs.sort((a, b) => (counts.get(a) || 0) - (counts.get(b) || 0));
  return chairs[0];
};

const checkIn = async (req, res) => {
  try {
    console.log('=== CHECK-IN START ===');
    console.log('User:', req.user);
    console.log('Body:', req.body);
    
    const role = String(req.user?.role || "").toLowerCase();
    const patientUser =
      role === "patient"
        ? req.user._id
        : req.body?.patientUser || req.body?.patientUserId;
    const department = String(req.body?.department || "").trim();

    console.log('Extracted patientUser:', patientUser);
    console.log('Extracted department:', department);

    if (!patientUser || !department) {
      console.log('Validation failed - missing fields');
      return res
        .status(400)
        .json({ message: "patientUser and department are required" });
    }

    const patientExists = await User.findOne({
      _id: patientUser,
      role: "patient",
      isActive: true,
    })
      .select("_id")
      .lean();

    if (!patientExists) {
      return res
        .status(404)
        .json({ message: "Patient account not found or inactive" });
    }

    const { start, end } = todayRange();
    const last = await QueueToken.findOne({ createdAt: { $gte: start, $lt: end } })
      .sort({ tokenNumber: -1 })
      .select("tokenNumber")
      .lean();

    const tokenNumber = Number(last?.tokenNumber || 0) + 1;
    const tokenLabel = `T${String(tokenNumber).padStart(3, "0")}`;

    const [assignedStudent, assignedFaculty, chair] = await Promise.all([
      pickLeastLoadedUser({ role: "student", department }),
      pickLeastLoadedUser({ role: "faculty", department }),
      pickChair({ department, requestedChair: req.body?.chair }),
    ]);

    const doc = await QueueToken.create({
      tokenNumber,
      tokenLabel,
      department,
      patientUser,
      assignedStudent,
      assignedFaculty,
      chair,
      status: "Waiting",
      priority: req.body?.priority || "Normal",
      symptoms: Array.isArray(req.body?.symptoms) ? req.body.symptoms : [],
      triageNotes: req.body?.triageNotes || "",
      checkedInBy: req.user?.id || null,
    });

    const out = await QueueToken.findById(doc._id)
      .populate("patientUser", "name email phone")
      .populate("assignedStudent", "name email department")
      .populate("assignedFaculty", "name email department")
      .lean();

    return res.status(201).json(out);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to check in patient", error: error.message });
  }
};

const getQueue = async (req, res) => {
  try {
    const { start, end } = todayRange();
    const query = { createdAt: { $gte: start, $lt: end } };

    if (req.query.department) query.department = String(req.query.department).trim();
    if (req.query.status) query.status = String(req.query.status).trim();

    const items = await QueueToken.find(query)
      .sort({ tokenNumber: 1 })
      .populate("patientUser", "name email phone")
      .populate("assignedStudent", "name department")
      .populate("assignedFaculty", "name department")
      .lean();

    return res.status(200).json({ items });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to fetch queue", error: error.message });
  }
};

const updateQueueStatus = async (req, res) => {
  try {
    const nextStatus = String(req.body?.status || "").trim();
    if (!ALLOWED_UPDATE_STATUSES.includes(nextStatus)) {
      return res.status(400).json({
        message: `status must be one of: ${ALLOWED_UPDATE_STATUSES.join(", ")}`,
      });
    }

    const doc = await QueueToken.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Token not found" });

    const role = String(req.user?.role || "").toLowerCase();
    const userId = String(req.user?.id || "");
    const isAdmin = role === "admin";
    const isAssignedFaculty =
      role === "faculty" && String(doc.assignedFaculty || "") === userId;
    const isAssignedStudent =
      role === "student" && String(doc.assignedStudent || "") === userId;
    const isPatientSelfCancel =
      role === "patient" &&
      String(doc.patientUser || "") === userId &&
      nextStatus === "Cancelled";

    if (!isAdmin && !isAssignedFaculty && !isAssignedStudent && !isPatientSelfCancel) {
      return res.status(403).json({ message: "Forbidden" });
    }

    doc.status = nextStatus;
    if (typeof req.body?.triageNotes === "string") {
      doc.triageNotes = req.body.triageNotes;
    }
    await doc.save();

    const out = await QueueToken.findById(doc._id)
      .populate("patientUser", "name email phone")
      .populate("assignedStudent", "name department")
      .populate("assignedFaculty", "name department")
      .lean();

    return res.status(200).json(out);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update queue status",
      error: error.message,
    });
  }
};

module.exports = {
  checkIn,
  getQueue,
  updateQueueStatus,
};
