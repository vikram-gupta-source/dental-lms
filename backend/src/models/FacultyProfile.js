const mongoose = require('mongoose');

const FacultyProfileSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    department: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['Faculty', 'Admin'],
        default: 'Faculty'
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('FacultyProfile', FacultyProfileSchema);