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
  UserCheck
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    jobs,
    applications,
    stats,
    addJob,
    updateApplicationStatus,
    deleteJob
  } = useAppState();

  const [activeTab, setActiveTab] = useState('jobs'); // 'jobs' | 'applicants'
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

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
    </DashboardLayout>
  );
};
