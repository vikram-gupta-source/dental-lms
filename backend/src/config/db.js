const mongoose = require("mongoose");
const env = require("./env");

const connectDB = async () => {
  try {
    await mongoose.connect(env.MONGODB_URI, {
      dbName: env.MONGODB_DATABASE_NAME,
    });
    console.log(
      `MongoDB connected successfully (${env.MONGODB_DATABASE_NAME})`,
    );
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
