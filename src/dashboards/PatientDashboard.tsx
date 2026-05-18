import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PatientOverview from './patient/PatientOverview';
import MedicationList from './patient/MedicationList';
import AIChatbot from './patient/AIChatbot';
import PharmacyFinder from './patient/PharmacyFinder';

const PatientDashboard = () => {
  return (
    <Routes>
      <Route path="dashboard" element={<PatientOverview />} />
      <Route path="medication" element={<MedicationList />} />
      <Route path="assistant" element={<AIChatbot />} />
      <Route path="pharmacy" element={<PharmacyFinder />} />
      <Route path="alerts" element={<div>Alerts coming soon...</div>} />
      <Route path="reports" element={<div>Reports coming soon...</div>} />
      <Route path="profile" element={<div>Profile coming soon...</div>} />
      <Route path="/" element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
};

export default PatientDashboard;
