# Dental Hospital Management & Teaching System - Backend

This project is a full-stack application designed to manage a dental hospital's operations and facilitate teaching for undergraduate (UG) and postgraduate (PG) students. It supports multiple user roles, including Patients, Students, Faculty, and Admins.

## Features

- **User Authentication**: Secure login and registration for all user roles.
- **Role Management**: Different functionalities based on user roles (Patient, Student, Faculty, Admin).
- **Appointment Management**: Patients can book, view, and manage their appointments.
- **Clinical Case Management**: Students can submit cases, and faculty can approve them.
- **User Management**: Admins can manage users and their roles.
- **Notification System**: Users receive notifications for appointments and updates.

## Tech Stack

- **Backend**: Node.js with Express
- **Database**: MongoDB with Mongoose
- **Frontend**: React Native (Expo)

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Navigate to the backend directory:
   ```
   cd dental-hospital-management-teaching-system/backend
   ```

3. Install dependencies:
   ```
   npm install
   ```

4. Set up environment variables:
   - Copy `.env.example` to `.env` and fill in the required values.

5. Start the server:
   ```
   npm start
   ```

## API Documentation

Refer to the individual route files in the `src/routes` directory for detailed API endpoints and their usage.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or features.

## License

This project is licensed under the MIT License. See the LICENSE file for details.