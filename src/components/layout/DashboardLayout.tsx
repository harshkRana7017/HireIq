import React, { useEffect } from 'react';
import { useAppState } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  id?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  activeTab,
  setActiveTab,
  id
}) => {
  const { currentUser } = useAppState();
  const navigate = useNavigate();

  // Route security guard: Redirect to login if user isn't logged in
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  if (!currentUser) return null;

  return (
    <div
      id={id || "app-dashboard-container"}
      className="min-h-screen flex flex-col bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-50 font-sans"
    >
      {/* Universal Top Header Navigation */}
      <Navbar />

      {/* Main Workspace Frame */}
      <div className="flex-grow flex flex-col lg:flex-row max-w-7xl w-full mx-auto px-0 sm:px-3 lg:px-4 py-0 lg:py-4 gap-0 lg:gap-4 min-h-[calc(100vh-4rem)]">
        {/* Navigation Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Dynamic Content Pane */}
        <main className="flex-grow bg-white dark:bg-zinc-900 border-t lg:border border-slate-200/80 rounded-none lg:rounded-xl p-3.5 sm:p-5 lg:p-6 shadow-sm overflow-x-hidden min-h-0">
          <div className="max-w-4xl mx-auto h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
