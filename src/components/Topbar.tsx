import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, Search, User as UserIcon } from 'lucide-react';

const Topbar = () => {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10">
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-medical-blue transition-colors" />
          <input 
            type="text" 
            placeholder="Search patient records, medications..." 
            className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-medical-blue/20 focus:bg-white transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 bg-slate-50 rounded-xl text-slate-500 hover:text-medical-blue hover:bg-medical-light transition-all relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="h-8 w-px bg-slate-200 mx-2"></div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-800">{user?.name}</p>
            <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
          </div>
          <div className="w-10 h-10 bg-medical-light rounded-xl flex items-center justify-center text-medical-blue overflow-hidden">
            {user?.name ? (
              <span className="font-bold text-lg">{user.name.charAt(0)}</span>
            ) : (
              <UserIcon className="w-6 h-6" />
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
