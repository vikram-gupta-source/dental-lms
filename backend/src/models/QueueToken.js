const mongoose = require("mongoose");

const queueTokenSchema = new mongoose.Schema(
  {
    tokenNumber: { type: Number, required: true, index: true },
    tokenLabel: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true, index: true },
    patientUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    assignedStudent: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    assignedFaculty: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    chair: { type: String, default: "", trim: true },
    status: {
      type: String,
      enum: ["Waiting", "InProgress", "Completed", "Cancelled"],
      default: "Waiting",
      index: true,
    },
    priority: {
      type: String,
      enum: ["Low", "Normal", "High", "Emergency"],
      default: "Normal",
    },
    symptoms: [{ type: String, trim: true }],
    triageNotes: { type: String, default: "" },
    checkedInBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

queueTokenSchema.index({ createdAt: -1, department: 1, status: 1 });

module.exports = mongoose.model("QueueToken", queueTokenSchema);
