const Notification = require("../models/Notification"); // Assuming a Notification model exists
const User = require("../models/User"); // Assuming a User model exists
const { sendEmail } = require("../utils/emailService"); // Assuming an email service utility exists

// Function to send appointment notifications
const sendAppointmentNotification = async (userId, appointmentDetails) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    const message = `Dear ${user.name}, your appointment is scheduled for ${appointmentDetails.date}.`;
    await sendEmail(user.email, "Appointment Notification", message);

    // Save notification to the database
    const notification = new Notification({
      userId: userId,
      message: message,
      type: "appointment",
      date: new Date(),
    });
    await notification.save();
  } catch (error) {
    console.error("Error sending appointment notification:", error);
  }
};

// Function to send case update notifications
const sendCaseUpdateNotification = async (userId, caseDetails) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    const message = `Dear ${user.name}, there is an update on your case: ${caseDetails.update}.`;
    await sendEmail(user.email, "Case Update Notification", message);

    // Save notification to the database
    const notification = new Notification({
      userId: userId,
      message: message,
      type: "case_update",
      date: new Date(),
    });
    await notification.save();
  } catch (error) {
    console.error("Error sending case update notification:", error);
  }
};

module.exports = {
  sendAppointmentNotification,
  sendCaseUpdateNotification,
};
