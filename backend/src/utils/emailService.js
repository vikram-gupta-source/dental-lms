const nodemailer = require('nodemailer');

const hasMailConfig =
  process.env.MAIL_SMTP &&
  process.env.MAIL_PORT &&
  process.env.MAIL_USER &&
  process.env.MAIL_PASS;

let transporter = null;

if (hasMailConfig) {
  transporter = nodemailer.createTransport({
    host: process.env.MAIL_SMTP,
    port: Number(process.env.MAIL_PORT),
    secure: Number(process.env.MAIL_PORT) === 465,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });
}

const sendEmail = async ({ to, subject, html, text }) => {
  if (!transporter) {
    console.warn('Email transporter not configured. Skipping email send.');
    return { skipped: true };
  }

  const info = await transporter.sendMail({
    from: process.env.MAIL_USER,
    to,
    subject,
    text,
    html,
  });

  return info;
};

module.exports = { sendEmail };