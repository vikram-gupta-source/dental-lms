const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config(); 

const env = require("./config/env");
const app = require("./app");

const PORT = Number(env.PORT || process.env.PORT || 5000);

mongoose
  .connect(process.env.MONGODB_URI, {
    dbName: process.env.MONGODB_DATABASE_NAME, // optional but recommended
  })
  .then(() => {
    console.log("MongoDB connected successfully");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });
