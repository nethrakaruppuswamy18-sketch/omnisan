# OMNISANITAS - Smart Medication Management

OmniSanitas is a full-stack premium healthcare application designed to synchronize medication management across Doctors, Patients, and Caretakers.

## Key Features
- **Role-Based Dashboards**: Customized experiences for Doctors, Patients, and Caretakers.
- **Medication Tracker**: Daily schedule management with adherence tracking.
- **Simulated AI Assistant**: Healthcare chatbot with symptom recognition and medical disclaimers.
- **Pharmacy Finder**: Simulated locator for nearby medical stores with distance and contact info.
- **Caretaker System**: Request-Approval workflow allowing caretakers to monitor patient medication status.
- **Custom Auth**: Secure JWT-based authentication with Bcrypt password hashing.

## Tech Stack
- **Frontend**: React, Vite, TypeScript, Tailwind CSS, Framer Motion, Recharts.
- **Backend**: Node.js, Express.js.
- **Database**: Mock persistent JSON store (Mongoose-ready structure).
- **Security**: JWT (JSON Web Tokens), Bcryptjs.

## Getting Started
1. Install dependencies: `npm install`
2. Run in development: `npm run dev`
3. Build for production: `npm run build`

## Project Structure
- `server.ts`: Express backend entry point with API logic.
- `src/App.tsx`: Main React routing and layout.
- `src/context/AuthContext.tsx`: Authentication state management.
- `src/dashboards/`: Role-specific dashboard views.
- `src/pages/`: Public pages (Landing, Login, Register).

---
*Disclaimer: This application is for demonstration purposes. AI responses are simulated and should not be used as professional medical advice.*
