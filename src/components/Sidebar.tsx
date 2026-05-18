import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Pill, 
  Bell, 
  FileText, 
  MessageSquare, 
  MapPin, 
  UserCircle, 
  Home, 
  Users, 
  Calendar,
  Activity,
  ClipboardList,
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

const Sidebar = () => {
  const { user, logout } = useAuth();

  const patientLinks = [
    { to: '/patient/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/patient/medication', label: 'Medication', icon: Pill },
    { to: '/patient/alerts', label: 'Alerts', icon: Bell },
    { to: '/patient/reports', label: 'Reports', icon: FileText },
    { to: '/patient/assistant', label: 'AI Assistant', icon: MessageSquare },
    { to: '/patient/pharmacy', label: 'Pharmacy', icon: MapPin },
    { to: '/patient/profile', label: 'Profile', icon: UserCircle },
  ];

  const doctorLinks = [
    { to: '/doctor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/doctor/patients', label: 'Patients', icon: Users },
    { to: '/doctor/prescriptions', label: 'Prescriptions', icon: ClipboardList },
    { to: '/doctor/schedule', label: 'Schedule', icon: Calendar },
    { to: '/doctor/alerts', label: 'Alerts', icon: Bell },
    { to: '/doctor/reports', label: 'Reports', icon: FileText },
    { to: '/doctor/profile', label: 'Profile', icon: UserCircle },
  ];

  const caretakerLinks = [
    { to: '/caretaker/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/caretaker/activity', label: 'Patient Activity', icon: Activity },
    { to: '/caretaker/medication', label: 'Medication Control', icon: Pill },
    { to: '/caretaker/alerts', label: 'Alerts', icon: Bell },
    { to: '/caretaker/profile', label: 'Profile', icon: UserCircle },
  ];

  let links = [];
  if (user?.role === UserRole.PATIENT) links = patientLinks;
  if (user?.role === UserRole.DOCTOR) links = doctorLinks;
  if (user?.role === UserRole.CARETAKER) links = caretakerLinks;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-slate-100 flex items-center gap-2">
        <div className="w-8 h-8 bg-medical-blue rounded-lg flex items-center justify-center">
          <Activity className="text-white w-5 h-5" />
        </div>
        <span className="text-xl font-bold text-slate-800 tracking-tight">OMNISANITAS</span>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <link.icon className="w-5 h-5" />
            {link.label}
          </NavLink>
        ))}
        
        <NavLink to="/" className="sidebar-link">
          <Home className="w-5 h-5" />
          Home
        </NavLink>
      </nav>

      <div className="p-4 border-t border-slate-100">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-red-500 hover:bg-red-50"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
