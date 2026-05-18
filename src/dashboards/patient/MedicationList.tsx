import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Pill, Plus, Trash2, Clock, Calendar, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const MedicationList = () => {
  const [medications, setMedications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMed, setNewMed] = useState({
    medicationName: '',
    dosage: '',
    frequency: 'Daily',
    timing: 'Morning'
  });

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

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/medications', newMed);
      setShowAddModal(false);
      setNewMed({ medicationName: '', dosage: '', frequency: 'Daily', timing: 'Morning' });
      fetchMedications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this medication tracking?')) return;
    try {
      await axios.delete(`/api/medications/${id}`);
      fetchMedications();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">My Medications</h1>
          <p className="text-slate-500">Manage and track your active medication plans.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="medical-btn-primary flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Medication
        </button>
      </header>

      {/* Grid of Medications */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence>
          {medications.map((med) => (
            <motion.div 
              key={med.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="medical-card border-l-4 border-l-medical-blue relative group"
            >
              <button 
                onClick={() => handleDelete(med.id)}
                className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-medical-light rounded-2xl flex items-center justify-center text-medical-blue">
                  <Pill className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-800">{med.medicationName}</h3>
                  <p className="text-sm text-slate-500">{med.dosage}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-3 rounded-xl">
                  <Calendar className="w-4 h-4 text-medical-blue" />
                  <span className="text-sm font-medium">{med.frequency}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-3 rounded-xl">
                  <Clock className="w-4 h-4 text-medical-blue" />
                  <span className="text-sm font-medium">{med.timing}</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-50 flex justify-between items-center text-xs text-slate-400">
                <span>Added: {new Date(med.createdAt).toLocaleDateString()}</span>
                <span className={`px-2 py-1 rounded-full font-bold ${med.completed ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                  {med.completed ? 'Completed Today' : 'Pending Today'}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {!loading && medications.length === 0 && (
        <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-slate-100">
          <Pill className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-800">No active medications</h3>
          <p className="text-slate-500 mb-8">Click "Add Medication" to start tracking your health schedule.</p>
          <button 
            onClick={() => setShowAddModal(true)}
            className="medical-btn-primary mx-auto flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Get Started
          </button>
        </div>
      )}

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setShowAddModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative z-10"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-bold text-slate-800">Add Medication</h3>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleAdd} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Medication Name</label>
                  <input 
                    type="text" 
                    required
                    value={newMed.medicationName}
                    onChange={(e) => setNewMed(prev => ({...prev, medicationName: e.target.value}))}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-medical-blue/20 focus:bg-white transition-all"
                    placeholder="e.g. Paracetamol"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Dosage</label>
                  <input 
                    type="text" 
                    required
                    value={newMed.dosage}
                    onChange={(e) => setNewMed(prev => ({...prev, dosage: e.target.value}))}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-medical-blue/20 focus:bg-white transition-all"
                    placeholder="e.g. 500mg"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Frequency</label>
                    <select 
                      value={newMed.frequency}
                      onChange={(e) => setNewMed(prev => ({...prev, frequency: e.target.value}))}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-medical-blue/20 transition-all font-medium"
                    >
                      <option>Daily</option>
                      <option>Weekly</option>
                      <option>Twice Weekly</option>
                      <option>Every Month</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Timing</label>
                    <select 
                      value={newMed.timing}
                      onChange={(e) => setNewMed(prev => ({...prev, timing: e.target.value}))}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-medical-blue/20 transition-all font-medium"
                    >
                      <option>Morning</option>
                      <option>Afternoon</option>
                      <option>Evening</option>
                      <option>Night</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4">
                  <button type="submit" className="w-full medical-btn-primary py-4 text-lg">
                    Confirm Registration
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MedicationList;
