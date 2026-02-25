# DANT_SETU

## Overview
The Dental Hospital Management & Teaching System is a full-stack application designed to manage the operations of a dental hospital while also serving as a teaching platform for undergraduate and postgraduate students. The system supports four user roles: Patient, UG/PG Student, Faculty, and Admin, each with specific functionalities.

## Tech Stack
- **Backend**: Node.js with Express
- **Database**: MongoDB with Mongoose
- **Frontend**: React Native with Expo

## Features
- **Patient Management**: Patients can book appointments, view their records, and manage their profiles.
- **Student Management**: Students can submit clinical cases, log procedures, and access their academic records.
- **Faculty Management**: Faculty members can approve cases, manage student evaluations, and oversee academic activities.
- **Admin Management**: Admins can manage users, oversee hospital operations, and generate reports.

## Project Structure
```
dental-hospital-management-teaching-system
├── backend
│   ├── src
│   ├── .env.example
│   ├── package.json
│   └── README.md
├── mobile
│   ├── src
│   ├── App.js
│   ├── app.json
│   ├── babel.config.js
│   └── package.json
├── .gitignore
├── package.json
└── README.md
```

## Getting Started

### Prerequisites
- Node.js
- MongoDB
- Expo CLI

### Installation

1. **Clone the repository**
   ```
   git clone <repository-url>
   cd dental-hospital-management-teaching-system
   ```

2. **Backend Setup**
   - Navigate to the backend directory:
     ```
     cd backend
     ```
   - Install dependencies:
     ```
     npm install
     ```
   - Create a `.env` file based on `.env.example` and configure your MongoDB connection.
   - Start the server:
     ```
     npm start
     ```

3. **Mobile Setup**
   - Navigate to the mobile directory:
     ```
     cd mobile
     ```
   - Install dependencies:
     ```
     npm install
     ```
   - Start the Expo application:
     ```
     expo start
     ```

## Usage
- Access the backend API at `http://localhost:5000` (or your configured port).
- Use the Expo Go app to scan the QR code and run the mobile application on your device.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any improvements or features.

## License
This project is licensed under the mahiitsrvices.in License. 