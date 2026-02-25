const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient" },
    date: { type: Date, required: true },
    department: { type: String, required: true },
    chair: { type: String, default: "" },
    status: {
      type: String,
      enum: ["Scheduled", "InProgress", "Completed", "Cancelled"],
      default: "Scheduled",
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Appointment", appointmentSchema);
