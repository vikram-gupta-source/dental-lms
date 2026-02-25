const nodemailer = require("nodemailer");
const env = require("./env");

const transporter = nodemailer.createTransport({
  host: env.MAIL_SMTP,
  port: env.MAIL_PORT,
  secure: env.MAIL_PORT === 465,
  auth: {
    user: env.MAIL_USER,
    pass: env.MAIL_PASS,
  },
});

module.exports = transporter;
