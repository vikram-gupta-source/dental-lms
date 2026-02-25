const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PatientProfile',
        required: true
    },
    treatmentDetails: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    dateIssued: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['Paid', 'Pending', 'Cancelled'],
        default: 'Pending'
    }
});

module.exports = mongoose.model('Invoice', invoiceSchema);