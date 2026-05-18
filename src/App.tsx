import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PatientDashboard from './dashboards/PatientDashboard';
import DoctorDashboard from './dashboards/DoctorDashboard';
import CaretakerDashboard from './dashboards/CaretakerDashboard';
import { UserRole } from './types';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: UserRole[] }) => {
  const { user, loading, isAuthenticated } = useAuth();
  
  if (loading) return <div className="h-screen w-screen flex items-center justify-center bg-white">Loading OMNISANITAS...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && user && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  
  return <>{children}</>;
};

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          <Route 
            path="/patient/*" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.PATIENT]}>
                <DashboardLayout><PatientDashboard /></DashboardLayout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/doctor/*" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.DOCTOR]}>
                <DashboardLayout><DoctorDashboard /></DashboardLayout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/caretaker/*" 
            element={
              <ProtectedRoute allowedRoles={[UserRole.CARETAKER]}>
                <DashboardLayout><CaretakerDashboard /></DashboardLayout>
              </ProtectedRoute>
            } 
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

function NotFound() {
  return (
    <div className="h-screen flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-6xl font-bold text-medical-blue mb-4">404</h1>
      <p className="text-xl text-slate-600 mb-8">Oops! The health records you're looking for aren't here.</p>
      <Link to="/" className="medical-btn-primary">Go Back Home</Link>
    </div>
  );
}
