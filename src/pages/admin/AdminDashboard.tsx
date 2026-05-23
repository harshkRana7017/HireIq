import React, { useState } from 'react';
import { useAppState } from '../../context/AppContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { JobCard } from '../../components/common/JobCard';
import { CandidateCard } from '../../components/common/CandidateCard';
import { MatchScoreCard } from '../../components/common/MatchScoreCard';
import { EmptyState } from '../../components/common/EmptyState';
import { Job, Application } from '../../types';
import {
  Briefcase,
  Users,
  Target,
  Award,
  Plus,
  ArrowLeft,
  Calendar,
  DollarSign,
  FileText,
  Trash2,
  Check,
  X,
  UserCheck,
  Plug,
  Mail,
  CloudLightning,
  Sparkles,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';

export const AdminDashboard: React.FC = () => {
  const {
    jobs,
    applications,
    stats,
    addJob,
    updateApplicationStatus,
    deleteJob,
    googleUser,
    connectGoogle,
    disconnectGoogle
  } = useAppState();

  const [activeTab, setActiveTab] = useState('jobs'); // 'jobs' | 'applicants' | 'integrations'
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  // Integrations states
  const [showMockLoginModal, setShowMockLoginModal] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [showCustomFields, setShowCustomFields] = useState(false);
  const [mockLoadingStep, setMockLoadingStep] = useState<string | null>(null);

  // Google OAuth flow setup
  const handleGoogleLogin = useGoogleLogin({
    scope: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events',
    onSuccess: async (tokenResponse) => {
      setIsConnecting(true);
      setErrorMessage(null);
      try {
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`,
          },
        });
        if (!res.ok) throw new Error('Failed to retrieve Google user profile.');
        const profile = await res.json();
        
        connectGoogle({
          name: profile.name || 'Google User',
          email: profile.email,
          picture: profile.picture,
          accessToken: tokenResponse.access_token
        });
      } catch (err: any) {
        console.error(err);
        setErrorMessage(err.message || 'Google authentication failed.');
        setShowMockLoginModal(true); // Fail-safe fallback to simulated login
      } finally {
        setIsConnecting(false);
      }
    },
    onError: (error) => {
      console.warn('Google OAuth login error:', error);
      setErrorMessage('Standard OAuth popup blocked or failed. Launching sandbox simulation instead.');
      setShowMockLoginModal(true);
    }
  });

  const triggerGoogleLogin = () => {
    setIsConnecting(true);
    setErrorMessage(null);
    try {
      handleGoogleLogin();
    } catch (err) {
      console.warn('Google OAuth initiation error, opening simulation popup:', err);
      setShowMockLoginModal(true);
      setIsConnecting(false);
    }
  };

  const handleSimulatedConnect = (name: string, email: string) => {
    setMockLoadingStep('Securing OAuth token...');
    setTimeout(() => {
      setMockLoadingStep('Fetching profile details...');
      setTimeout(() => {
        setMockLoadingStep('Syncing Google Calendar...');
        setTimeout(() => {
          connectGoogle({
            name,
            email,
            picture: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`
          });
          setMockLoadingStep(null);
          setShowMockLoginModal(false);
        }, 800);
      }, 700);
    }, 600);
  };

  // Form states for creating new position
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [location, setLocation] = useState('');
  const [type, setType] = useState<'Full-time' | 'Part-time' | 'Contract' | 'Remote'>('Full-time');
  const [description, setDescription] = useState('');
  const [salary, setSalary] = useState('');
  const [skillsText, setSkillsText] = useState('');
  const [requirementsText, setRequirementsText] = useState('');

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');

  // Handle new job submission
  const handleCreateJobSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const skills = skillsText.split(',').map(s => s.trim()).filter(Boolean);
    const requirements = requirementsText.split('\n').map(r => r.trim()).filter(Boolean);

    addJob({
      title,
      department,
      location: location || 'Remote',
      type,
      description,
      salary: salary || 'TBD',
      skills: skills.length > 0 ? skills : ['React', 'TypeScript'],
      requirements: requirements.length > 0 ? requirements : ['Prior team communication experience.']
    });

    // Reset clean states
    setTitle('');
    setLocation('');
    setDescription('');
    setSalary('');
    setSkillsText('');
    setRequirementsText('');
    setShowCreateForm(false);
  };

  // Filtered applications based on active selection
  const filteredApps = applications.filter(app => {
    const matchesJob = selectedJob ? app.jobId === selectedJob.id : true;
    if (!matchesJob) return false;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const inName = app.candidateName.toLowerCase().includes(term);
      const inEmail = app.candidateEmail.toLowerCase().includes(term);
      const inResume = app.resumeText.toLowerCase().includes(term);
      return inName || inEmail || inResume;
    }
    return true;
  });

  const getJobTitle = (jobId: string) => {
    return jobs.find(j => j.id === jobId)?.title || 'Unknown Position';
  };

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={(tab) => {
      setActiveTab(tab);
      setSelectedJob(null);
      setSelectedApp(null);
    }}>
      {/* 1. MAIN JOBS POOL TAB */}
      {activeTab === 'jobs' && !selectedJob && (
        <div className="space-y-6">
          <PageHeader
            title="SaaS Recruitment Portal"
            description="Manage your job requirements and analyze match indexes."
            badge="Admin Console"
            actions={
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm cursor-pointer transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Position</span>
              </button>
            }
          />

          {/* Core Analytics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              title="Open Positions"
              value={stats.totalJobs}
              icon={Briefcase}
              color="indigo"
              trend={{ value: '+12%', type: 'positive' }}
            />
            <StatCard
              title="Total Applicants"
              value={stats.totalApplications}
              icon={Users}
              color="emerald"
              trend={{ value: '+18%', type: 'positive' }}
            />
            <StatCard
              title="Avg AI Match Rate"
              value={`${stats.averageMatchRate}%`}
              icon={Target}
              color="amber"
              description="Calculated over resumes"
            />
            <StatCard
              title="Top Tier Fits (80%+)"
              value={stats.highMatchCount}
              icon={Award}
              color="rose"
              description="Immediate hires suggested"
            />
          </div>

          {/* Inline Job Creation Form */}
          {showCreateForm && (
            <div className="border border-indigo-150-50 bg-indigo-50/5 dark:bg-zinc-900/40 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-805 space-y-4 text-left">
              <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <span className="text-sm font-bold text-zinc-800 dark:text-zinc-50 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-indigo-500" />
                  Define Application Criteria
                </span>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="p-1 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateJobSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block mb-1">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Senior Frontend Developer"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-800 rounded-lg bg-[#090d16] text-slate-200 focus:outline-inner focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block mb-1">
                    Department
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-800 rounded-lg text-slate-200 bg-[#090d16] focus:outline-inner"
                  >
                    <option className="bg-[#0f172a]">Engineering</option>
                    <option className="bg-[#0f172a]">Design</option>
                    <option className="bg-[#0f172a]">Product & Design</option>
                    <option className="bg-[#0f172a]">Management</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block mb-1">
                    Salary range
                  </label>
                  <input
                    type="text"
                    placeholder="$120,000 - $145,000"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-800 rounded-lg text-slate-200 bg-[#090d16]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block mb-1">
                    Location / Office Details
                  </label>
                  <input
                    type="text"
                    placeholder="Austin, TX or Remote"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-800 rounded-lg text-slate-200 bg-[#090d16]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block mb-1">
                    Job Assignment Type (Schedules)
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 border border-slate-800 rounded-lg text-slate-200 bg-[#090d16]"
                  >
                    <option className="bg-[#0f172a]">Full-time</option>
                    <option className="bg-[#0f172a]">Part-time</option>
                    <option className="bg-[#0f172a]">Contract</option>
                    <option className="bg-[#0f172a]">Remote</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block mb-1">
                    Core Target Skills (Comma Separated for AI indexing matcher) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="React, TypeScript, Tailwind CSS, Cypress, State Management"
                    value={skillsText}
                    onChange={(e) => setSkillsText(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-800 rounded-lg text-slate-200 bg-[#090d16]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block mb-1">
                    Specific Experience criteria (split with enters)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="E.g. 3+ years experience creating React sites.&#10;Familiarity with visual testing suites like Cypress."
                    value={requirementsText}
                    onChange={(e) => setRequirementsText(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-800 rounded-lg text-slate-200 bg-[#090d16] focus:outline-inner"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block mb-1">
                    General Description *
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Enter short description of daily roles and platform integrations..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-800 rounded-lg text-slate-200 bg-[#090d16] focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2 flex justify-end gap-2.5 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 text-xs font-semibold text-zinc-500 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                  >
                    Post Position
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Jobs Listing */}
          <div className="space-y-4">
            <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block pl-1">
              Currently Recruiting ({jobs.length})
            </span>
            {jobs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {jobs.map(job => (
                  <div key={job.id} className="relative group">
                    <JobCard
                      job={job}
                      onClick={() => {
                        setSelectedJob(job);
                        setSelectedApp(null);
                      }}
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteJob(job.id);
                      }}
                      className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer duration-200"
                      title="Delete Posting"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No Positions Uploaded"
                description="Populate your company pipeline by creating candidate filters."
                actionText="Create Position"
                onActionClick={() => setShowCreateForm(true)}
              />
            )}
          </div>
        </div>
      )}

      {/* 2. SPECIFIC EXPANDED JOB APPLICANTS SUB-VIEW */}
      {activeTab === 'jobs' && selectedJob && !selectedApp && (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedJob(null)}
              className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 text-zinc-500"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Back to positions</span>
          </div>

          <PageHeader
            title={selectedJob.title}
            description={`${selectedJob.department} • ${selectedJob.location} • ${selectedJob.salary}`}
            badge={`${selectedJob.applicantsCount} Applicants`}
          />

          {/* Submittals list for selected job */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-zinc-50 pb-3">
              <span className="text-sm font-bold text-zinc-800 dark:text-zinc-50 block">
                Applicant Resumes ({filteredApps.length})
              </span>
              <input
                type="text"
                placeholder="Search candidate name, email, or resume keyword..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-xs px-3.5 py-2 border border-zinc-200 dark:border-zinc-800/80 rounded-xl bg-[#fcfcfd] dark:bg-zinc-900 w-full sm:w-80"
              />
            </div>

            {filteredApps.length > 0 ? (
              <div className="grid grid-cols-1 gap-3.5">
                {filteredApps.map(app => (
                  <CandidateCard
                    key={app.id}
                    application={app}
                    onClick={() => setSelectedApp(app)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No Applicants Available"
                description={
                  searchTerm
                    ? "Adjust search terms or query alternative skills details."
                    : "No candidates have applied to this target criteria yet. Open candidate panel to apply."
                }
              />
            )}
          </div>
        </div>
      )}

      {/* 3. MULTI-JOB CRM TAB (CANDIDATES TAB) */}
      {activeTab === 'applicants' && !selectedApp && (
        <div className="space-y-6">
          <PageHeader
            title="Candidates CRM Ledger"
            description="Inspect overall match scores across all job classifications."
            badge="Unified Applications"
          />

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-zinc-50 pb-3">
              <span className="text-sm font-bold text-zinc-800 dark:text-zinc-50 block">
                All Applicants ({filteredApps.length})
              </span>
              <input
                type="text"
                placeholder="Filter Candidates CRM..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-xs px-3.5 py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-[#fcfcfd] dark:bg-zinc-900 w-full sm:w-80"
              />
            </div>

            {filteredApps.length > 0 ? (
              <div className="grid grid-cols-1 gap-3">
                {filteredApps.map(app => (
                  <CandidateCard
                    key={app.id}
                    application={app}
                    jobTitle={getJobTitle(app.jobId)}
                    onClick={() => setSelectedApp(app)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No Applicants Registered"
                description="Candidates will populate this register on resume submittal."
              />
            )}
          </div>
        </div>
      )}

      {/* 4. EXPANDED INTEGRATED CANDIDATE SCORECARD & RESUME INSPECTOR */}
      {selectedApp && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedApp(null)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 text-slate-500 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
              {activeTab === 'jobs' ? `Back to ${getJobTitle(selectedApp.jobId)} applicants` : 'Back to Candidates CRM'}
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold tracking-tight text-slate-900 dark:text-zinc-50">
                  {selectedApp.candidateName}
                </h2>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${
                  selectedApp.status === 'Accepted'
                    ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                    : selectedApp.status === 'Declined'
                    ? 'bg-rose-50 border-rose-100 text-rose-700'
                    : selectedApp.status === 'Interviewing'
                    ? 'bg-indigo-50 border-indigo-150 text-indigo-700 font-bold'
                    : 'bg-slate-100 border-slate-200 text-slate-650 dark:bg-zinc-800 dark:border-zinc-700'
                }`}>
                  {selectedApp.status}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 dark:text-zinc-400">
                Applied to <strong className="font-semibold text-slate-700">{getJobTitle(selectedApp.jobId)}</strong> on {selectedApp.appliedDate}
              </p>
            </div>

            {/* Recruiter Action Status Controls */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => updateApplicationStatus(selectedApp.id, 'Interviewing')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border pointer-cursor transition-all flex items-center gap-1 shadow-xs ${
                  selectedApp.status === 'Interviewing'
                    ? 'bg-indigo-600 border-indigo-600 text-white'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Calendar className="w-3 h-3" />
                Invite
              </button>

              <button
                onClick={() => updateApplicationStatus(selectedApp.id, 'Accepted')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border pointer-cursor transition-all flex items-center gap-1 shadow-xs ${
                  selectedApp.status === 'Accepted'
                    ? 'bg-emerald-600 border-emerald-600 text-white font-bold'
                    : 'bg-white border-slate-200 text-slate-705 hover:bg-slate-50'
                }`}
              >
                <UserCheck className="w-3 h-3" />
                Hire
              </button>

              <button
                onClick={() => updateApplicationStatus(selectedApp.id, 'Declined')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border pointer-cursor transition-all flex items-center gap-1 shadow-xs ${
                  selectedApp.status === 'Declined'
                    ? 'bg-rose-600 border-rose-600 text-white font-bold'
                    : 'bg-white border-slate-200 text-slate-705 hover:bg-slate-50'
                }`}
              >
                <X className="w-3.5 h-3.5" />
                Decline
              </button>
            </div>
          </div>

          {/* Graphical Scorecard */}
          <MatchScoreCard
            percentage={selectedApp.matchPercentage}
            analysis={selectedApp.matchAnalysis}
            candidateName={selectedApp.candidateName}
          />

          {/* Raw Text CV Inspector */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 text-left">
            <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest block mb-2.5 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Raw Resume Inspector ({selectedApp.resumeFileName})
            </span>
            <div className="bg-slate-50/50 dark:bg-zinc-950 p-4 rounded-lg border border-slate-100 dark:border-zinc-855/80 max-h-[220px] overflow-y-auto text-xs text-slate-655 dark:text-zinc-400 leading-relaxed font-mono whitespace-pre-line shadow-inner">
              {selectedApp.resumeText}
            </div>
          </div>
        </div>
      )}
      {/* 5. INTEGRATIONS TAB */}
      {activeTab === 'integrations' && !selectedApp && (
        <div className="space-y-6">
          <PageHeader
            title="Integrations & Connections"
            description="Manage and configure connected APIs, OAuth identities, and workspace platforms."
            badge="System Pipelines"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Google Workspace Connection Card */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 relative overflow-hidden transition-all duration-300 hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/5 group text-left">
              {/* Background gradient decorative element */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo-500/10 to-transparent rounded-bl-full pointer-events-none" />

              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-indigo-50/10 dark:bg-zinc-800 flex items-center justify-center">
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-50">
                      Google Workspace
                    </h3>
                    <p className="text-[10px] text-slate-500">OAuth 2.0 Auth Sync</p>
                  </div>
                </div>

                {googleUser ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Connected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    Offline
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed mb-5">
                Enable automated scheduling for candidate interviews directly onto your Google Calendar, and send personalized updates using secure Google authentication.
              </p>

              {googleUser ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-slate-50/50 dark:bg-zinc-950/50 border border-slate-100 dark:border-zinc-800/80 rounded-xl">
                    {googleUser.picture ? (
                      <img
                        src={googleUser.picture}
                        alt="Google Account"
                        className="w-10 h-10 rounded-full border border-indigo-500/20"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-indigo-650 flex items-center justify-center text-white font-bold text-sm">
                        {googleUser.name.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-800 dark:text-zinc-150 truncate">
                        {googleUser.name}
                      </p>
                      <p className="text-[10px] text-slate-550 dark:text-zinc-500 truncate font-mono">
                        {googleUser.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={disconnectGoogle}
                      className="w-full py-2 text-center text-xs font-bold text-rose-500 hover:text-white bg-transparent hover:bg-rose-600 border border-rose-500/30 hover:border-rose-600 rounded-xl transition-all duration-200 cursor-pointer"
                    >
                      Disconnect Integration
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <button
                    onClick={triggerGoogleLogin}
                    disabled={isConnecting}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-650/50 rounded-xl shadow-sm transition-all duration-150 cursor-pointer"
                  >
                    {isConnecting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Initializing...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12.24 10.285V13.4h6.887C18.2 15.614 15.645 18 12.24 18c-3.86 0-7-3.14-7-7s3.14-7 7-7c1.7 0 3.25.61 4.47 1.636l2.427-2.427C17.27 1.482 14.92 1 12.24 1 6.162 1 1.24 5.922 1.24 12s4.922 11 11 11c6.338 0 10.545-4.455 10.545-10.715 0-.727-.08-1.282-.173-1.718L12.24 10.285z" />
                        </svg>
                        <span>Connect Google</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setErrorMessage(null);
                      setShowMockLoginModal(true);
                    }}
                    className="px-3.5 py-2.5 text-xs font-bold text-slate-500 dark:text-zinc-400 hover:text-indigo-400 bg-slate-50/50 dark:bg-zinc-950/50 border border-slate-100 dark:border-zinc-800/80 hover:border-indigo-500/20 rounded-xl transition-all duration-150 cursor-pointer"
                  >
                    Simulate Sign-in
                  </button>
                </div>
              )}
            </div>

            {/* Slack Connection Card */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 relative overflow-hidden transition-all duration-300 hover:border-[#4A154B]/30 hover:shadow-lg hover:shadow-[#4A154B]/5 text-left opacity-90">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#4A154B]/10 to-transparent rounded-bl-full pointer-events-none" />

              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-[#4A154B]/10 flex items-center justify-center">
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                      <path
                        fill="#E01E5A"
                        d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523 2.528 2.528 0 0 1-2.522-2.523 2.528 2.528 0 0 1 2.522-2.52h2.52v2.52zm1.261 0a2.528 2.528 0 0 1 2.52-2.52h5.043a2.528 2.528 0 0 1 2.522 2.52v5.042a2.528 2.528 0 0 1-2.522 2.52H8.823a2.528 2.528 0 0 1-2.52-2.52v-5.042zM8.823 5.043a2.528 2.528 0 0 1 2.52-2.52 2.528 2.528 0 0 1 2.522 2.52v2.52h-2.522a2.528 2.528 0 0 1-2.52-2.52zm0 1.261a2.528 2.528 0 0 1 2.52 2.52v5.043a2.528 2.528 0 0 1-2.522 2.522H3.78a2.528 2.528 0 0 1-2.522-2.522 2.528 2.528 0 0 1 2.522-2.52h5.043zM18.958 8.823a2.528 2.528 0 0 1 2.52-2.52 2.528 2.528 0 0 1 2.522 2.52 2.528 2.528 0 0 1-2.522 2.52h-2.52v-2.52zm-1.261 0a2.528 2.528 0 0 1-2.52 2.52h-5.043a2.528 2.528 0 0 1-2.522-2.52V3.78a2.528 2.528 0 0 1 2.522-2.52h5.043a2.528 2.528 0 0 1 2.52 2.52v5.043zM15.165 18.958a2.528 2.528 0 0 1-2.52 2.52 2.528 2.528 0 0 1-2.522-2.52v-2.52h2.522a2.528 2.528 0 0 1 2.52 2.52zm0-1.261a2.528 2.528 0 0 1-2.52-2.52v-5.043a2.528 2.528 0 0 1 2.522-2.522h5.043a2.528 2.528 0 0 1 2.522 2.522v5.043a2.528 2.528 0 0 1-2.522 2.52H15.165z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-50">
                      Slack Notifications
                    </h3>
                    <p className="text-[10px] text-slate-550">Instant Event Hooks</p>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-zinc-800 text-zinc-400 border border-zinc-700">
                  Ready to pair
                </span>
              </div>

              <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed mb-5">
                Automatically push high-affinity candidate resumes, top AI matching alerts, and recruiter notifications directly to designated company channels.
              </p>

              <button
                disabled
                className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-zinc-400 bg-zinc-800/40 border border-zinc-800/80 rounded-xl cursor-not-allowed"
              >
                Connect Slack Channel
              </button>
            </div>

            {/* ATS File Import (Google Drive / cloud sync) */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 relative overflow-hidden transition-all duration-300 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5 text-left opacity-90 md:col-span-2">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <CloudLightning className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-50 flex items-center gap-2">
                      ATS Bulk Imports
                      <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 font-bold uppercase tracking-wider">
                        Enterprise API
                      </span>
                    </h3>
                    <p className="text-[10px] text-slate-500">Import Candidate CVS from Google Drive Folder</p>
                  </div>
                </div>

                <button
                  disabled
                  className="px-4 py-2 text-xs font-semibold text-emerald-500/50 bg-emerald-500/5 border border-emerald-500/10 rounded-xl cursor-not-allowed"
                >
                  Configure Bulk Sync
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. GOOGLE SIGN-IN MOCK MODAL (SANDBOX FALLBACK) */}
      {showMockLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs transition-opacity duration-300">
          <div className="w-full max-w-sm bg-[#080b13] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-6 text-center relative overflow-hidden">
            {/* Top Close Button */}
            <button
              onClick={() => {
                if (!mockLoadingStep) {
                  setShowMockLoginModal(false);
                  setMockLoadingStep(null);
                }
              }}
              disabled={!!mockLoadingStep}
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-white/5 text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header Content */}
            <div className="flex flex-col items-center space-y-2.5">
              {/* Google Classic Logo Mock */}
              <div className="flex items-center gap-1 text-lg font-bold select-none tracking-tight">
                <span className="text-blue-500">G</span>
                <span className="text-red-500">o</span>
                <span className="text-yellow-500">o</span>
                <span className="text-blue-500">g</span>
                <span className="text-green-500">l</span>
                <span className="text-red-500">e</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Sign in with Google</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  to continue to <span className="text-indigo-400 font-bold">HireIq Portal</span>
                </p>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 text-[11px] text-amber-400 bg-amber-500/5 border border-amber-500/10 rounded-xl leading-relaxed text-left">
                {errorMessage}
              </div>
            )}

            {/* Spinner loader state */}
            {mockLoadingStep ? (
              <div className="py-8 flex flex-col items-center justify-center space-y-4">
                <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
                <p className="text-xs font-semibold text-slate-300 animate-pulse">
                  {mockLoadingStep}
                </p>
              </div>
            ) : (
              <div className="space-y-3.5 text-left">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block pl-1">
                  Select Sandbox Account
                </span>

                <div className="space-y-2">
                  <button
                    onClick={() => handleSimulatedConnect('Harsh Rana', 'harsh.rana@hireiq.ai')}
                    className="w-full flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] hover:border-indigo-500/30 transition-all text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                        HR
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-200">Harsh Rana</p>
                        <p className="text-[10px] text-slate-500 font-mono">harsh.rana@hireiq.ai</p>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold text-slate-500 group-hover:text-indigo-400 transition-colors uppercase">
                      Admin
                    </span>
                  </button>

                  <button
                    onClick={() => handleSimulatedConnect('Alex Mercer', 'alex.mercer@hireiq.ai')}
                    className="w-full flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] hover:border-indigo-500/30 transition-all text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-xs">
                        AM
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-200">Alex Mercer</p>
                        <p className="text-[10px] text-slate-500 font-mono">alex.mercer@hireiq.ai</p>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold text-slate-500 group-hover:text-indigo-400 transition-colors uppercase">
                      Sandbox
                    </span>
                  </button>

                  {showCustomFields ? (
                    <div className="p-3 border border-white/10 rounded-xl bg-white/[0.01] space-y-3">
                      <div>
                        <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          placeholder="E.g. Sarah Jenkins"
                          value={customName}
                          onChange={(e) => setCustomName(e.target.value)}
                          className="w-full text-xs px-2.5 py-1.5 border border-white/10 rounded-lg text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">
                          Email Address
                        </label>
                        <input
                          type="email"
                          placeholder="E.g. sarah@company.com"
                          value={customEmail}
                          onChange={(e) => setCustomEmail(e.target.value)}
                          className="w-full text-xs px-2.5 py-1.5 border border-white/10 rounded-lg text-white"
                        />
                      </div>

                      <div className="flex gap-2 justify-end pt-1">
                        <button
                          type="button"
                          onClick={() => setShowCustomFields(false)}
                          className="px-2.5 py-1 text-[10px] font-semibold text-slate-400 hover:text-slate-200"
                        >
                          Back
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (customName.trim() && customEmail.trim()) {
                              handleSimulatedConnect(customName.trim(), customEmail.trim());
                            }
                          }}
                          className="px-3 py-1 text-[10px] font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                        >
                          Use Account
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowCustomFields(true)}
                      className="w-full py-2.5 text-center text-[10px] font-bold text-indigo-400 hover:text-indigo-300 border border-dashed border-white/10 hover:border-indigo-500/30 rounded-xl transition-all cursor-pointer"
                    >
                      + Use Another Sandbox Identity
                    </button>
                  )}
                </div>

                <div className="pt-3 text-[10px] text-slate-500 text-center leading-relaxed">
                  HireIq Sandbox uses Google OAuth protocols. Your credentials are mock-secured locally inside client-side session scopes.
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
