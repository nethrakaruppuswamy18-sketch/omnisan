import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Pill, AlertCircle, CheckCircle2, Clock, Calendar, TrendingUp, Activity, HeartHandshake } from 'lucide-react';
import { motion } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Mon', completion: 80 },
  { name: 'Tue', completion: 100 },
  { name: 'Wed', completion: 60 },
  { name: 'Thu', completion: 90 },
  { name: 'Fri', completion: 100 },
  { name: 'Sat', completion: 100 },
  { name: 'Sun', completion: 85 },
];

const PatientOverview = () => {
  const [medications, setMedications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMedications();
  }, []);

  const fetchMedications = async () => {
    try {
      const res = await axios.get('/api/medications');
      setMedications(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleComplete = async (id: string, current: boolean) => {
    try {
      await axios.put(`/api/medications/${id}`, { completed: !current });
      fetchMedications();
    } catch (err) {
      console.error(err);
    }
  };

  const completedCount = medications.filter(m => m.completed).length;
  const totalCount = medications.length;
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const [caretakerEmail, setCaretakerEmail] = useState('');
  const [requestStatus, setRequestStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleAddCaretaker = async (e: React.FormEvent) => {
    e.preventDefault();
    setRequestStatus('loading');
    try {
      await axios.post('/api/caretaker/request', { email: caretakerEmail });
      setRequestStatus('success');
      setCaretakerEmail('');
      setTimeout(() => setRequestStatus('idle'), 3000);
    } catch (err) {
      setRequestStatus('error');
      setTimeout(() => setRequestStatus('idle'), 3000);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Welcome Back, Healthy!</h1>
          <p className="text-slate-500">Here's your health overview for today.</p>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
           <HeartHandshake className="w-5 h-5 text-medical-blue" />
           <form onSubmit={handleAddCaretaker} className="flex gap-2">
             <input 
              type="email" 
              placeholder="Caretaker Email"
              value={caretakerEmail}
              onChange={(e) => setCaretakerEmail(e.target.value)}
              className="text-xs border-b border-slate-200 outline-none focus:border-medical-blue py-1"
             />
             <button 
              disabled={!caretakerEmail || requestStatus !== 'idle'}
              className="text-xs font-bold text-medical-blue hover:underline disabled:opacity-50"
             >
               {requestStatus === 'loading' ? 'Sending...' : requestStatus === 'success' ? 'Sent!' : 'Invite'}
             </button>
           </form>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="medical-card bg-medical-blue text-white">
          <div className="flex justify-between items-start mb-4">
            <Pill className="w-8 h-8 opacity-80" />
            <TrendingUp className="w-5 h-5 opacity-60" />
          </div>
          <p className="text-slate-100 text-sm font-medium">Daily Adherence</p>
          <h3 className="text-3xl font-bold">{percentage}%</h3>
        </div>

        <div className="medical-card">
          <div className="flex justify-between items-start mb-4">
            <Clock className="w-8 h-8 text-orange-500" />
            <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-md">Pending</span>
          </div>
          <p className="text-slate-500 text-sm font-medium">Remaining Meds</p>
          <h3 className="text-3xl font-bold">{totalCount - completedCount}</h3>
        </div>

        <div className="medical-card">
          <div className="flex justify-between items-start mb-4">
            <Calendar className="w-8 h-8 text-medical-blue" />
          </div>
          <p className="text-slate-500 text-sm font-medium">Next Checkup</p>
          <h3 className="text-2xl font-bold">24 May</h3>
        </div>

        <div className="medical-card">
          <div className="flex justify-between items-start mb-4">
            <Activity className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-slate-500 text-sm font-medium">Heart Rate</p>
          <h3 className="text-3xl font-bold">72 <span className="text-sm font-normal text-slate-400">bpm</span></h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Medication Schedule */}
        <div className="lg:col-span-2 medical-card">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-slate-800">Todays Schedule</h3>
            <button className="text-medical-blue text-sm font-bold hover:underline">View All</button>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-12 text-slate-400">Loading schedule...</div>
            ) : medications.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <Pill className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No medications scheduled for today.</p>
              </div>
            ) : (
              medications.map((med, idx) => (
                <div key={med.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-sm transition-all group">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${med.completed ? 'bg-green-100 text-green-600' : 'bg-medical-light text-medical-blue'}`}>
                    <Clock className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-bold ${med.completed ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                      {med.medicationName}
                    </h4>
                    <p className="text-xs text-slate-500">{med.dosage} • {med.timing}</p>
                  </div>
                  <button 
                    onClick={() => toggleComplete(med.id, med.completed)}
                    className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                      med.completed ? 'bg-green-500 text-white' : 'bg-white border border-slate-200 text-slate-300 hover:border-medical-blue hover:text-medical-blue'
                    }`}
                  >
                    <CheckCircle2 className="w-6 h-6" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Adherence Chart */}
        <div className="medical-card">
          <h3 className="text-xl font-bold text-slate-800 mb-6">Adherence Trends</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Line 
                  type="monotone" 
                  dataKey="completion" 
                  stroke="#5BC0EB" 
                  strokeWidth={3} 
                  dot={{r: 4, fill: '#5BC0EB', strokeWidth: 2, stroke: '#fff'}}
                  activeDot={{r: 6}}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 p-4 bg-medical-light rounded-2xl flex items-center gap-3">
            <AlertCircle className="text-medical-blue w-5 h-5 shrink-0" />
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              You missed your dosage on Wednesday. Try to maintain a 100% streak for better results!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientOverview;
