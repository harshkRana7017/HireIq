import React from 'react';
import { useAppState } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Shield, Briefcase, ChevronRight } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { currentUser, login, logout } = useAppState();
  const navigate = useNavigate();

  const handleToggleRole = () => {
    if (!currentUser) return;
    if (currentUser.role === 'admin') {
      // Toggle to candidate
      login('Alex Rivera', 'alex.rivera@gmail.com', 'candidate');
      navigate('/candidate');
    } else {
      // Toggle to admin
      login('Sarah Jenkins', 's.jenkins@recruitai.com', 'admin');
      navigate('/admin');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-zinc-800 bg-white/85 dark:bg-zinc-950/80 backdrop-blur-md px-4 sm:px-6 h-14 flex items-center justify-between">
      {/* Brand logo */}
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-xs">
          <Briefcase className="w-4.5 h-4.5 text-white stroke-[2]" />
        </div>
        <div>
          <span className="text-sm font-bold text-slate-900 dark:text-zinc-50 tracking-tight flex items-center gap-1.5">
            TalentSync
            <span className="text-[9px] font-medium bg-slate-50 dark:bg-zinc-800 text-slate-500 border border-slate-200/60 dark:border-zinc-700/60 px-1.5 py-0.2 rounded">v1.0</span>
          </span>
        </div>
      </div>

      {/* Right navigation actions */}
      {currentUser && (
        <div className="flex items-center gap-3">
          {/* Quick toggle for Demo Roles */}
          <button
            onClick={handleToggleRole}
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-slate-50/50 dark:bg-zinc-900 hover:bg-slate-100/85 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 text-slate-650 dark:text-zinc-350 transition-colors cursor-pointer"
            title="Switch testing credentials quickly"
          >
            Switch to {currentUser.role === 'admin' ? 'Candidate' : 'Recruiter'}
            <ChevronRight className="w-3 h-3 text-slate-400" />
          </button>

          <div className="h-5 w-[1px] bg-slate-200 dark:bg-zinc-800 hidden sm:block" />

          {/* User Details */}
          <div className="flex items-center gap-2">
            <img
              src={currentUser.avatarUrl || "https://api.dicebear.com/7.x/adventurer/svg?seed=mock"}
              alt="Avatar"
              referrerPolicy="no-referrer"
              className="w-7 h-7 rounded-lg border border-slate-100 dark:border-zinc-800 p-0.5 bg-slate-50"
            />
            <div className="hidden md:block text-left text-xs">
              <p className="font-semibold text-slate-700 dark:text-zinc-100 leading-none">
                {currentUser.name}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                {currentUser.role === 'admin' ? (
                  <span className="text-[8px] font-semibold px-1 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100/40">
                    Recruiter
                  </span>
                ) : (
                  <span className="text-[8px] font-semibold px-1 py-0.2 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-100/40">
                    Candidate
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/20 dark:hover:text-rose-400 text-slate-400 transition-colors cursor-pointer"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      )}
    </header>
  );
};
