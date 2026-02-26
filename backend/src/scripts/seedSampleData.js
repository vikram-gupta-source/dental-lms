const path = require("path");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const User = require("../models/User");
const Patient = require("../models/Patient");
const CaseRecord = require("../models/CaseRecord");
const ProcedureLog = require("../models/ProcedureLog");

const DEPARTMENTS = [
  "Oral Surgery",
  "Orthodontics",
  "Periodontics",
  "Endodontics",
  "Prosthodontics",
  "Pedodontics",
  "General Dentistry",
];

async function connect() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DATABASE_NAME;

  if (!uri || !dbName) {
    throw new Error("Missing MONGODB_URI or MONGODB_DATABASE_NAME in backend/.env");
  }

  await mongoose.connect(uri, { dbName });
  console.log(`Connected to MongoDB (${dbName})`);
}

async function upsertUser({ name, email, role, department = "", rollNo = "", studentYear = 1, passwordHash }) {
  return User.findOneAndUpdate(
    { email: email.toLowerCase() },
    {
      $set: {
        name,
        email: email.toLowerCase(),
        password: passwordHash,
        role,
        department,
        rollNo,
        studentYear,
        isActive: true,
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
}

async function upsertPatient({ mrn, name, phone, department }) {
  return Patient.findOneAndUpdate(
    { mrn },
    {
      $set: {
        mrn,
        name,
        phone,
        department,
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
}

async function seed() {
  const passwordHash = await bcrypt.hash("Password@123", 10);

  const [admin, faculty1, faculty2, student1, student2] = await Promise.all([
    upsertUser({
      name: "System Admin",
      email: "admin@dental.com",
      role: "admin",
      passwordHash,
    }),
    upsertUser({
      name: "Dr. Meera Faculty",
      email: "faculty1@dental.com",
      role: "faculty",
      department: "Endodontics",
      passwordHash,
    }),
    upsertUser({
      name: "Dr. Karan Faculty",
      email: "faculty2@dental.com",
      role: "faculty",
      department: "Oral Surgery",
      passwordHash,
    }),
    upsertUser({
      name: "UG001 Student",
      email: "student1@dental.com",
      role: "student",
      department: "Endodontics",
      rollNo: "UG001",
      studentYear: 3,
      passwordHash,
    }),
    upsertUser({
      name: "UG002 Student",
      email: "student2@dental.com",
      role: "student",
      department: "Oral Surgery",
      rollNo: "UG002",
      studentYear: 4,
      passwordHash,
    }),
  ]);

  const patients = await Promise.all([
    upsertPatient({ mrn: "OPD001", name: "Ravi Kumar", phone: "9876500001", department: "Endodontics" }),
    upsertPatient({ mrn: "OPD002", name: "Sneha Patel", phone: "9876500002", department: "Oral Surgery" }),
    upsertPatient({ mrn: "OPD003", name: "Asha Singh", phone: "9876500003", department: "Prosthodontics" }),
    upsertPatient({ mrn: "OPD004", name: "Imran Ali", phone: "9876500004", department: "Periodontics" }),
    upsertPatient({ mrn: "OPD005", name: "Priya Nair", phone: "9876500005", department: "Orthodontics" }),
  ]);

  await CaseRecord.deleteMany({ notes: /^\[seed\]/ });
  await ProcedureLog.deleteMany({ notes: /^\[seed\]/ });

  const cases = await CaseRecord.insertMany([
    {
      patient: patients[0]._id,
      assignedStudent: student1._id,
      supervisor: faculty1._id,
      department: "Endodontics",
      status: "Submitted",
      complaint: "Severe pain in lower molar",
      diagnosis: "Irreversible pulpitis",
      procedure: "RCT",
      toothNo: "36",
      notes: "[seed] Initial visit with pain on biting",
      facultyApproved: false,
    },
    {
      patient: patients[1]._id,
      assignedStudent: student2._id,
      supervisor: faculty2._id,
      department: "Oral Surgery",
      status: "Submitted",
      complaint: "Swelling near wisdom tooth",
      diagnosis: "Impacted third molar",
      procedure: "Extraction",
      toothNo: "48",
      notes: "[seed] Referred for surgical extraction",
      facultyApproved: false,
    },
    {
      patient: patients[2]._id,
      assignedStudent: student1._id,
      supervisor: faculty1._id,
      department: "Prosthodontics",
      status: "Draft",
      complaint: "Missing upper incisors",
      diagnosis: "Partial edentulism",
      procedure: "RPD",
      toothNo: "11, 12",
      notes: "[seed] Treatment planning case",
      facultyApproved: false,
    },
  ]);

  const logs = await ProcedureLog.insertMany([
    {
      studentId: student1._id,
      patient: patients[0]._id,
      procedureType: "RCT",
      count: 5,
      requiredQuota: 20,
      notes: "[seed] Completed in simulation and clinic",
    },
    {
      studentId: student2._id,
      patient: patients[1]._id,
      procedureType: "Extraction",
      count: 8,
      requiredQuota: 25,
      notes: "[seed] Mostly posterior teeth",
    },
    {
      studentId: student1._id,
      patient: patients[2]._id,
      procedureType: "RPD",
      count: 2,
      requiredQuota: 10,
      notes: "[seed] Framework stage",
    },
  ]);

  console.log("Seed complete");
  console.log(`Users: 5 (admin/faculty/students) - login password: Password@123`);
  console.log(`Patients: ${patients.length}`);
  console.log(`Cases: ${cases.length}`);
  console.log(`Procedure Logs: ${logs.length}`);
  console.log(`Departments covered: ${DEPARTMENTS.join(", ")}`);
  console.log("Suggested logins: student1@dental.com, student2@dental.com, faculty1@dental.com");

  void admin;
}

(async () => {
  try {
    await connect();
    await seed();
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
})();
