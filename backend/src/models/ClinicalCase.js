const mongoose = require('mongoose');

const clinicalCaseSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PatientProfile',
        required: true
    },
    assignedStudent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'StudentProfile',
        required: true
    },
    status: {
        type: String,
        enum: ['Open', 'In Progress', 'Closed'],
        default: 'Open'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('ClinicalCase', clinicalCaseSchema);