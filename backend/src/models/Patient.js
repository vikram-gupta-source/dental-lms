const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
  {
    mrn: { type: String, required: true, unique: true, index: true, trim: true },
    name: { type: String, required: true, trim: true, index: true },
    phone: { type: String, trim: true },
    demographics: {
      age: Number,
      gender: String,
      address: String,
      bloodGroup: String,
    },
    department: { type: String, trim: true, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Patient', patientSchema);
