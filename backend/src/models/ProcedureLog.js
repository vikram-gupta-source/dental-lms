const mongoose = require('mongoose');

const ProcedureLogSchema = new mongoose.Schema({
    procedureType: {
        type: String,
        required: true
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient'
    },
    count: {
        type: Number,
        default: 1
    },
    requiredQuota: {
        type: Number,
        default: 0
    },
    date: {
        type: Date,
        default: Date.now
    },
    notes: {
        type: String,
        default: ''
    }
});

// Create compound index for efficient student + procedure queries
ProcedureLogSchema.index({ studentId: 1, procedureType: 1 });

module.exports = mongoose.model('ProcedureLog', ProcedureLogSchema);