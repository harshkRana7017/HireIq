import React, { useState, useEffect } from 'react';
import { useAppState } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Briefcase, ArrowRight, ShieldCheck, UserCheck, AlertCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const { currentUser, login } = useAppState();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'candidate'>('admin');
  const [notification, setNotification] = useState<string | null>(null);

  // If already logged in, redirect right away
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/candidate');
      }
    }
  }, [currentUser, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setNotification('Please enter your name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setNotification('Please enter a valid email address.');
      return;
    }

    login(name, email, role);
    setNotification(null);
  };

  const triggerQuickLogin = (selectedRole: 'admin' | 'candidate') => {
    if (selectedRole === 'admin') {
      login('Sarah Jenkins', 's.jenkins@recruitai.com', 'admin');
    } else {
      login('Alex Rivera', 'alex.rivera@gmail.com', 'candidate');
    }
  };

  return (
    <div
      id="login-workspace-container"
      className="min-h-screen flex flex-col justify-center items-center px-4 sm:px-6 py-12 bg-[#060810] font-sans"
    >
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Greeting Header */}
        <div className="text-center">
          <div className="mx-auto h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-600/10">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white">
            Welcome to TalentSync
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            AI-assisted applicant screening platform
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-6 shadow-sm">
          {notification && (
            <div className="mb-3.5 flex items-center gap-2 text-xs font-semibold text-rose-400 bg-rose-950/20 px-3 py-2 rounded-lg border border-rose-900/40">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{notification}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="fullname" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">
                Full Name
              </label>
              <input
                id="fullname"
                type="text"
                placeholder="Sarah Jenkins"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 bg-[#090d16] border border-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none text-slate-200 placeholder-slate-600 transition-all font-medium"
              />
            </div>

            <div>
              <label htmlFor="email" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="s.jenkins@recruitai.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 bg-[#090d16] border border-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none text-slate-200 placeholder-slate-600 transition-all font-medium"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">
                Role Assignment
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`flex flex-col items-center p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                    role === 'admin'
                      ? 'border-indigo-500 bg-indigo-950/40 text-indigo-400 ring-2 ring-indigo-500/10 font-bold'
                      : 'border-slate-800 bg-[#090d16]/40 hover:bg-[#090d16] text-slate-400'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 mb-1 text-indigo-500" />
                  <span className="text-xs">Recruiter</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('candidate')}
                  className={`flex flex-col items-center p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                    role === 'candidate'
                      ? 'border-indigo-500 bg-indigo-950/40 text-indigo-400 ring-2 ring-indigo-500/10 font-bold'
                      : 'border-slate-800 bg-[#090d16]/40 hover:bg-[#090d16] text-slate-400'
                  }`}
                >
                  <UserCheck className="w-4 h-4 mb-1 text-indigo-500" />
                  <span className="text-xs">Candidate</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs transition-colors shadow-sm flex items-center justify-center gap-1.5 cursor-pointer mt-2"
            >
              Enter Sandbox App
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Direct Demonstration Shortcuts */}
          <div className="mt-5 pt-4 border-t border-slate-800 text-center">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Demographic Fast Access
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => triggerQuickLogin('admin')}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 bg-[#090d16] hover:bg-[#090d16]/80 border border-slate-800 cursor-pointer transition-colors"
              >
                Recruiter Admin
              </button>
              <button
                onClick={() => triggerQuickLogin('candidate')}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 bg-[#090d16] hover:bg-[#090d16]/80 border border-slate-800 cursor-pointer transition-colors"
              >
                Candidate User
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
