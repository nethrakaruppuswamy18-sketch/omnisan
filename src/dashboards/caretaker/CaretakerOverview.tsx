import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  HeartHandshake, 
  Users, 
  Check, 
  X, 
  Clock, 
  Pill, 
  AlertCircle, 
  ChevronRight,
  ShieldCheck,
  User as UserIcon,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const CaretakerOverview = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [reqsRes, patientsRes] = await Promise.all([
        axios.get('/api/caretaker/pending-requests'),
        axios.get('/api/caretaker/patients')
      ]);
      setRequests(reqsRes.data);
      setPatients(patientsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await axios.put(`/api/caretaker/approve/${id}`, { status });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-800">Caretaker Control</h1>
        <p className="text-slate-500">Monitor and assist your registered patients.</p>
      </header>

      {/* Requests Banner */}
      <AnimatePresence>
        {requests.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-medical-light border border-medical-blue/20 p-6 rounded-[2rem] mb-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-medical-blue shadow-sm">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">Pending Approvals</h3>
                  <p className="text-xs text-slate-600">Patients waiting for your assistance</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4">
                {requests.map(req => (
                  <div key={req.id} className="bg-white p-4 rounded-2xl flex items-center justify-between gap-6 shadow-sm border border-slate-50 min-w-[300px]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-400">
                        {req.patientName?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{req.patientName}</p>
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Patient ID: {req.patientId.substr(0,8)}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleAction(req.id, 'approved')} className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-all">
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleAction(req.id, 'rejected')} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monitored Patients */}
        <div className="medical-card">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-slate-800">Assigned Patients</h3>
            <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-xs font-bold">{patients.length} Registered</span>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-12 text-slate-400">Loading patients...</div>
            ) : patients.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                <HeartHandshake className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 max-w-[200px] mx-auto text-sm">Once you approve a request, your patients will appear here.</p>
              </div>
            ) : (
              patients.map(p => (
                <div key={p.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:bg-white hover:shadow-lg transition-all group">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-medical-light text-medical-blue rounded-2xl flex items-center justify-center font-bold text-xl">
                        {p.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-slate-800">{p.name}</h4>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <Activity className="w-3 h-3" /> Monitoring Active
                        </p>
                      </div>
                    </div>
                    <button className="p-2 bg-white rounded-xl text-slate-400 hover:text-medical-blue shadow-sm opacity-0 group-hover:opacity-100 transition-all">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                      <div className="flex items-center gap-2 mb-1 text-medical-blue">
                        <Pill className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Scheduled Meds</span>
                      </div>
                      <p className="text-lg font-bold text-slate-800">{p.medications?.length || 0} Dose(s)</p>
                    </div>
                    <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                      <div className="flex items-center gap-2 mb-1 text-green-500">
                        <Clock className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Completion</span>
                      </div>
                      <p className="text-lg font-bold text-slate-800">
                        {p.medications?.filter((m: any) => m.completed).length || 0} / {p.medications?.length || 0}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Global Activity Feed */}
        <div className="medical-card">
          <h3 className="text-xl font-bold text-slate-800 mb-8">Recent Activity</h3>
          <div className="relative space-y-8 before:absolute before:left-[1.25rem] before:top-2 before:bottom-2 before:w-px before:bg-slate-100">
            {patients.flatMap(p => p.medications?.filter((m:any) => m.completed) || []).slice(0, 5).map((log: any, idx) => (
              <div key={idx} className="relative pl-10">
                <div className="absolute left-0 top-0 w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-600 border-4 border-white shadow-sm">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-slate-800">Dose Taken</span>
                    <span className="text-[10px] text-slate-400 font-bold">• Just now</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Your patient completed their {log.medicationName} ({log.dosage}) as scheduled.
                  </p>
                </div>
              </div>
            ))}
            
            {patients.flatMap(p => p.medications?.filter((m:any) => !m.completed) || []).length > 0 && (
               <div className="relative pl-10">
                <div className="absolute left-0 top-0 w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center text-orange-600 border-4 border-white shadow-sm">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-slate-800 font-bold">Pending Dose</span>
                    <span className="text-[10px] text-slate-400 font-bold">• Scheduled</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Some medications are still pending for today. Reminder alerts will be triggered if overdue.
                  </p>
                </div>
              </div>
            )}

            {patients.length === 0 && (
              <div className="text-center py-20 text-slate-300">
                No activity to display yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaretakerOverview;
