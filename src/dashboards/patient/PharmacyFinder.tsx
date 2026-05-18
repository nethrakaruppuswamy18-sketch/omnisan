import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapPin, Phone, Search, Navigation2, ExternalLink, Star } from 'lucide-react';
import { Pharmacy } from '../../types';

const PharmacyFinder = () => {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [filtered, setFiltered] = useState<Pharmacy[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPharmacies = async () => {
      try {
        const res = await axios.get('/api/pharmacy/list');
        setPharmacies(res.data);
        setFiltered(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPharmacies();
  }, []);

  useEffect(() => {
    const term = search.toLowerCase();
    setFiltered(pharmacies.filter(p => p.name.toLowerCase().includes(term) || p.address.toLowerCase().includes(term)));
  }, [search, pharmacies]);

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Pharmacy Finder</h1>
          <p className="text-slate-500">Find and contact nearby pharmacy partner stores.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search city or store name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-medical-blue/20 transition-all"
          />
        </div>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-48 bg-slate-100 rounded-2xl border border-slate-50"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((pharmacy) => (
            <div key={pharmacy.id} className="medical-card group overflow-hidden flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-medical-light rounded-xl flex items-center justify-center text-medical-blue group-hover:bg-medical-blue group-hover:text-white transition-colors">
                  <MapPin className="w-6 h-6" />
                </div>
                <span className="bg-green-50 text-green-600 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                  <Star className="w-3 h-3 fill-green-600" />
                  Partner
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-slate-800 mb-1">{pharmacy.name}</h3>
              <p className="text-sm text-slate-500 mb-6 flex-1">{pharmacy.address}</p>
              
              <div className="flex items-center gap-4 py-4 border-t border-slate-50">
                <div className="flex-1">
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Distance</p>
                  <p className="text-sm font-bold text-slate-700 flex items-center gap-1">
                    <Navigation2 className="w-3 h-3 text-medical-blue" />
                    {pharmacy.distance}
                  </p>
                </div>
                <div className="flex-1">
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Contact</p>
                  <p className="text-sm font-bold text-slate-700 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-medical-blue" />
                    {pharmacy.phone}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 medical-btn-primary flex items-center justify-center gap-2 py-2 text-sm">
                  Direction
                </button>
                <button className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors">
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-20 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
          <MapPin className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-800">No pharmacies found</h3>
          <p className="text-slate-500">Try searching with a different keyword or city.</p>
        </div>
      )}
    </div>
  );
};

export default PharmacyFinder;
