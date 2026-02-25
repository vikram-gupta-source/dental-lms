const mongoose = require('mongoose');

const ProcedureLogSchema = new mongoose.Schema({
    procedureType: {
        type: String,
        required: true
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'StudentProfile',
        required: true
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

module.exports = mongoose.model('ProcedureLog', ProcedureLogSchema);