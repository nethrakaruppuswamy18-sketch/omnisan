import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import CaretakerOverview from './caretaker/CaretakerOverview';

const CaretakerDashboard = () => {
  return (
    <Routes>
      <Route path="dashboard" element={<CaretakerOverview />} />
      <Route path="activity" element={<CaretakerOverview />} />
      <Route path="medication" element={<CaretakerOverview />} />
      <Route path="alerts" element={<div>Alerts coming soon...</div>} />
      <Route path="profile" element={<div>Profile coming soon...</div>} />
      <Route path="/" element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
};

export default CaretakerDashboard;
