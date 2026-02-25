require('dotenv').config();

const required = [
  'MONGODB_URI',
  'MONGODB_DATABASE_NAME',
  'MAIL_SMTP',
  'MAIL_PORT',
  'MAIL_USER',
  'MAIL_PASS',
  'JWT_SECRET',
];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required env key: ${key}`);
  }
}

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT || 5000),

  MONGODB_URI: process.env.MONGODB_URI,
  MONGODB_DATABASE_NAME: process.env.MONGODB_DATABASE_NAME,

  MAIL_SMTP: process.env.MAIL_SMTP,
  MAIL_PORT: Number(process.env.MAIL_PORT || 465),
  MAIL_USER: process.env.MAIL_USER,
  MAIL_PASS: process.env.MAIL_PASS,

  JWT_SECRET: process.env.JWT_SECRET,
};