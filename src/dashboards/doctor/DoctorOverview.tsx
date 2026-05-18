import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, ClipboardList, AlertCircle, Calendar, Plus, ExternalLink, Mail, User as UserIcon } from 'lucide-react';
import { motion } from 'motion/react';

const DoctorOverview = () => {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await axios.get('/api/doctor/patients');
        setPatients(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Doctor Dashboard</h1>
          <p className="text-slate-500">Manage your patients and monitor treatment compliance.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-all flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Schedule
          </button>
          <button className="medical-btn-primary flex items-center gap-2">
            <Plus className="w-5 h-5" /> New Prescription
          </button>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="medical-card">
          <div className="flex justify-between items-start mb-4">
            <Users className="w-8 h-8 text-medical-blue" />
          </div>
          <p className="text-slate-500 text-sm font-medium">Total Patients</p>
          <h3 className="text-3xl font-bold">{patients.length}</h3>
        </div>
        <div className="medical-card">
          <div className="flex justify-between items-start mb-4">
            <ClipboardList className="w-8 h-8 text-green-500" />
          </div>
          <p className="text-slate-500 text-sm font-medium">Active prescriptions</p>
          <h3 className="text-3xl font-bold">12</h3>
        </div>
        <div className="medical-card">
          <div className="flex justify-between items-start mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-slate-500 text-sm font-medium">Critical Alerts</p>
          <h3 className="text-3xl font-bold text-red-500">3</h3>
        </div>
        <div className="medical-card">
          <div className="flex justify-between items-start mb-4">
            <Calendar className="w-8 h-8 text-orange-500" />
          </div>
          <p className="text-slate-500 text-sm font-medium">Appointments Today</p>
          <h3 className="text-3xl font-bold">8</h3>
        </div>
      </div>

      {/* Patient List */}
      <div className="medical-card">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-xl font-bold text-slate-800">Assigned Patients</h3>
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Filter patients..." 
              className="bg-slate-50 border border-slate-100 rounded-lg py-1 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-medical-blue"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-50 text-left">
                <th className="pb-4 font-bold text-slate-400 text-sm uppercase tracking-wider">Patient Name</th>
                <th className="pb-4 font-bold text-slate-400 text-sm uppercase tracking-wider">Contact</th>
                <th className="pb-4 font-bold text-slate-400 text-sm uppercase tracking-wider">Status</th>
                <th className="pb-4 font-bold text-slate-400 text-sm uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400">Loading patients...</td>
                </tr>
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400">No patients assigned yet.</td>
                </tr>
              ) : (
                patients.map((patient) => (
                  <tr key={patient.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 text-medical-blue rounded-xl flex items-center justify-center font-bold">
                          {patient.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{patient.name}</p>
                          <p className="text-xs text-slate-400">ID: {patient.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Mail className="w-4 h-4 opacity-50" />
                        <span className="text-sm">{patient.email}</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-bold rounded-full uppercase tracking-widest">Stable</span>
                    </td>
                    <td className="py-4 text-right">
                      <button className="p-2 text-slate-400 hover:text-medical-blue transition-colors">
                        <ExternalLink className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DoctorOverview;
