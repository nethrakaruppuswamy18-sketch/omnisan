import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DoctorOverview from './doctor/DoctorOverview';

const DoctorDashboard = () => {
  return (
    <Routes>
      <Route path="dashboard" element={<DoctorOverview />} />
      <Route path="patients" element={<DoctorOverview />} /> {/* Reusing for demo */}
      <Route path="prescriptions" element={<div>Prescriptions coming soon...</div>} />
      <Route path="schedule" element={<div>Schedule coming soon...</div>} />
      <Route path="alerts" element={<div>Alerts coming soon...</div>} />
      <Route path="reports" element={<div>Reports coming soon...</div>} />
      <Route path="profile" element={<div>Profile coming soon...</div>} />
      <Route path="/" element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
};

export default DoctorDashboard;
