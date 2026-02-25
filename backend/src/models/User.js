const mongoose = require("mongoose");
const bcrypt = require("bcryptjs"); // was: require('bcrypt')

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      enum: ["admin", "faculty", "student", "patient"],
      default: "patient",
    },
    department: {
      type: String,
      required: function () {
        return this.role === "faculty" || this.role === "student";
      },
    },
    isActive: { type: Boolean, default: true },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },

    // faculty
    designation: { type: String, default: "" },
    experienceYears: { type: Number, default: 0 },

    // student
    studentYear: { type: Number, default: 1 },
    rollNo: { type: String, default: "" },

    // patient
    guardianName: { type: String, default: "" },
    medicalNotes: { type: String, default: "" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
