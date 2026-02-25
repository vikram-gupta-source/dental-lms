const Report = require('../models/Report'); // Assuming a Report model exists

exports.generateAuditReport = async (filter) => {
    try {
        const reports = await Report.find(filter).populate('userId', 'name email'); // Example of populating user details
        return reports;
    } catch (error) {
        throw new Error('Error generating audit report: ' + error.message);
    }
};

exports.getReportById = async (reportId) => {
    try {
        const report = await Report.findById(reportId).populate('userId', 'name email');
        if (!report) {
            throw new Error('Report not found');
        }
        return report;
    } catch (error) {
        throw new Error('Error fetching report: ' + error.message);
    }
};