import React from 'react';
import { useAppState } from '../../context/AppContext';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Briefcase,
  Users,
  Shield,
  Send,
  Plug
} from 'lucide-react';

interface SidebarProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  id?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, id }) => {
  const { currentUser, jobs, applications } = useAppState();
  const location = useLocation();
  const navigate = useNavigate();

  if (!currentUser) return null;

  const isAdmin = currentUser.role === 'admin';

  // Navigation options based on configuration
  const adminNav = [
    { id: 'jobs', label: 'Job Postings', icon: Briefcase, count: jobs.length },
    { id: 'applicants', label: 'Candidates CRM', icon: Users, count: applications.length },
    { id: 'integrations', label: 'Integrations', icon: Plug, count: 0 },
  ];

  const candidateNav = [
    { id: 'explore', label: 'Explore Positions', icon: Briefcase, count: jobs.length },
    { id: 'my-applications', label: 'My Applications', icon: Send, count: applications.filter(a => a.candidateEmail === currentUser.email).length },
  ];

  const currentNav = isAdmin ? adminNav : candidateNav;

  return (
    <aside
      id={id || "app-sidebar"}
      className="w-full lg:w-60 border-r border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 lg:rounded-xl lg:border lg:shadow-xs px-3 py-4 flex flex-col gap-4 flex-shrink-0"
    >
      {/* Navigation Block */}
      <div className="flex flex-col gap-1 flex-grow">
        <span className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest pl-2 mb-1">
          Control Panel
        </span>

        {currentNav.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab && setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 text-left cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/10'
                  : 'text-zinc-650 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-zinc-400 dark:text-zinc-500'}`} />
                <span>{item.label}</span>
              </div>
              {item.count > 0 && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-indigo-700 text-indigo-100'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                  }`}
                >
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Recruiter / Candidate Helper Card */}
      <div className="border border-slate-100 dark:border-zinc-800 rounded-xl p-3 bg-slate-50 dark:bg-zinc-900/20 text-[11px]">
        <div className="flex items-center gap-1 font-bold text-slate-800 dark:text-zinc-200">
          <Shield className="w-3 h-3 text-indigo-500" />
          <span>Role Authorization</span>
        </div>
        <p className="mt-1 text-slate-500 dark:text-zinc-400 leading-snug">
          Logged in as <strong className="text-slate-700 dark:text-zinc-350">{currentUser.role === 'admin' ? 'Recruiter' : 'Candidate'}</strong>. All status transitions are mock-sync'd offline.
        </p>
      </div>
    </aside>
  );
};
