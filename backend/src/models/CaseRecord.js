const mongoose = require("mongoose");

const caseVersionSchema = new mongoose.Schema(
  {
    versionNo: { type: Number, required: true },
    originalScanPdfUrl: { type: String, default: "" },
    structuredData: { type: mongoose.Schema.Types.Mixed, default: {} },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    changedAt: { type: Date, default: Date.now },
    notes: { type: String, default: "" },
  },
  { _id: false },
);

const caseRecordSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    assignedStudent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    supervisor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    department: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["Draft", "Submitted", "Approved", "Rejected", "Referred"],
      default: "Draft",
    },
    // Clinical details
    complaint: { type: String, default: "" },
    diagnosis: { type: String, default: "" },
    procedure: { type: String, default: "" },
    toothNo: { type: String, default: "" },
    notes: { type: String, default: "" },
    facultyApproved: { type: Boolean, default: false },
    // Legacy fields
    currentOriginalScanPdfUrl: { type: String, default: "" },
    currentStructuredData: { type: mongoose.Schema.Types.Mixed, default: {} },
    referredToDepartments: [{ type: String, trim: true }],
    versionHistory: { type: [caseVersionSchema], default: [] },
  },
  { timestamps: true },
);

module.exports = mongoose.model("CaseRecord", caseRecordSchema);
