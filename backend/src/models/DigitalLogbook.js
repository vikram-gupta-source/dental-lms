const mongoose = require("mongoose");

const digitalLogbookSchema = new mongoose.Schema(
  {
    procedureType: { type: String, required: true, trim: true },
    competencyMapped: { type: String, required: true, trim: true },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    facultyApprovalStatus: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    radiographImageUrl: { type: String, default: "" },
    remarks: { type: String, default: "" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("DigitalLogbook", digitalLogbookSchema);
