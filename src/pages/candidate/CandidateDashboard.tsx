import React, { useState } from 'react';
import { useAppState } from '../../context/AppContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { PageHeader } from '../../components/common/PageHeader';
import { JobCard } from '../../components/common/JobCard';
import { MatchBadge } from '../../components/common/MatchBadge';
import { ResumeUpload } from '../../components/candidate/ResumeUpload';
import { EmptyState } from '../../components/common/EmptyState';
import { Job, Application } from '../../types';
import {
  Briefcase,
  Layers,
  FileCheck,
  Send,
  MapPin,
  DollarSign,
  ArrowLeft,
  Calendar,
  AlertCircle,
  Clock,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export const CandidateDashboard: React.FC = () => {
  const { jobs, applications, currentUser, addApplication, analyzing } = useAppState();

  const [activeTab, setActiveTab] = useState('explore'); // 'explore' | 'my-applications'
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // Application process status
  const [submissionCompleted, setSubmissionCompleted] = useState<Application | null>(null);

  if (!currentUser) return null;

  // Filter applications submitted by current logged-in user
  const myApplications = applications.filter(app => app.candidateEmail === currentUser.email);

  const handleResumeMatchComplete = async (fileName: string, rawText: string, file: File) => {
    if (!selectedJob) return;

    // Trigger application context logic which calculates match indexes immediately
    const newlyCreatedApp = await addApplication(
      selectedJob.id,
      currentUser.name,
      currentUser.email,
      fileName,
      rawText,
      file
    );

    // Render completion card
    setSubmissionCompleted(newlyCreatedApp);
  };

  const getJobDetails = (jobId: string) => {
    return jobs.find(j => j.id === jobId);
  };

  const resetSubmissionFlow = () => {
    setSelectedJob(null);
    setSubmissionCompleted(null);
    setActiveTab('my-applications'); // Take candidate to review status!
  };

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={(tab) => {
      setActiveTab(tab);
      setSelectedJob(null);
      setSubmissionCompleted(null);
    }}>
      {/* 1. EXPLORE JOBS LIST TAB */}
      {activeTab === 'explore' && !selectedJob && (
        <div className="space-y-6">
          <PageHeader
            title="Discovery Center"
            description="Explore our active listings and trigger instant AI matching with your CV."
            badge="Candidate Mode"
          />

          <div className="space-y-4">
            <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block pl-1">
              Active Roles Open ({jobs.length})
            </span>
            {jobs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {jobs.map(job => (
                  <JobCard
                    key={job.id}
                    job={job}
                    actionText="Apply & Match"
                    onActionClick={() => {
                      setSelectedJob(job);
                      setSubmissionCompleted(null);
                    }}
                    onClick={() => {
                      setSelectedJob(job);
                      setSubmissionCompleted(null);
                    }}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No Careers Open Right Now"
                description="We populate roles dynamically. Check back soon for future listings."
              />
            )}
          </div>
        </div>
      )}

      {/* 2. SPECIFIC EXPANDED JOB CRITERIA & APPLY WORKSPACE */}
      {activeTab === 'explore' && selectedJob && (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedJob(null)}
              className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-805 hover:bg-zinc-100 text-zinc-500 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Back to discovery center</span>
          </div>

          <PageHeader
            title={selectedJob.title}
            description={`${selectedJob.department} • ${selectedJob.location} • ${selectedJob.salary}`}
            badge={selectedJob.type}
          />

          {!submissionCompleted ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Requirements and specifics */}
              <div className="lg:col-span-2 space-y-5 text-left">
                {/* Description */}
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Role Overview</h4>
                  <p className="text-xs text-zinc-650 dark:text-zinc-400 leading-relaxed bg-zinc-50/50 dark:bg-zinc-900/40 p-4 rounded-xl border border-zinc-100 dark:border-zinc-805">
                    {selectedJob.description}
                  </p>
                </div>

                {/* Specific items checklist */}
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-55">Expected Credentials</h4>
                  <ul className="space-y-2 bg-[#090d16]/60 p-4 rounded-xl border border-slate-800 text-xs">
                    {selectedJob.requirements.map((req, idx) => (
                      <li key={idx} className="flex gap-2 text-zinc-400">
                        <span className="text-indigo-500 font-bold leading-none">•</span>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Targeted Index skills */}
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-55">Target Index Keywords</h4>
                  <p className="text-[11px] text-zinc-400 font-medium">
                    Our AI model screens raw CV files against the following parameters. Ensure these exist in your resume text to yield top tier scores:
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1.5">
                    {selectedJob.skills.map(s => (
                      <span key={s} className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 px-2.5 py-1 rounded font-bold">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Upload Resume Module */}
              <div className="lg:col-span-1 space-y-3">
                {analyzing && (
                  <div className="relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 via-violet-500/5 to-transparent p-4 backdrop-blur-sm">

                    <div className="absolute inset-0 opacity-20">
                      <div className="h-full w-full animate-pulse bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
                    </div>

                    <div className="relative flex items-center gap-3">

                      <div className="h-5 w-5 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />

                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-indigo-100">
                          AI is analyzing the resume...
                        </p>

                        <p className="text-xs text-zinc-400">
                          Matching skills, experience, and role relevance.
                        </p>
                      </div>

                    </div>
                  </div>
                )}
                <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block pl-0.5">
                  Submit CV For Analysis
                </span>
                <ResumeUpload onUploadSuccess={handleResumeMatchComplete} />
              </div>
            </div>
          ) : (
            // Success Modal / Completed block
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-6 text-center max-w-xl mx-auto space-y-5 shadow-md">
              <div className="p-3.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 inline-block ring-8 ring-emerald-50/30">
                <FileCheck className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-zinc-950 dark:text-zinc-50 tracking-tight">
                  Application Logged Successfully!
                </h3>
                <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Your details have been submitted to the Recruiter pipeline. Our AI matching score has computed your alignment at <strong className="font-bold text-zinc-750">{submissionCompleted.matchPercentage}%</strong>.
                </p>
              </div>

              {/* Instant Alignment score pill */}
              <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-100 dark:border-zinc-805 flex items-center justify-between">
                <div className="text-left">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Candidate Evaluation</span>
                  <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">{currentUser.name}</span>

                </div>
                <MatchBadge percentage={submissionCompleted.matchPercentage} />
              </div>
              <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">{submissionCompleted.matchAnalysis.summary}</span>


              <div className="pt-3 border-t border-zinc-50 flex justify-end gap-3.5">
                <button
                  onClick={() => setSelectedJob(null)}
                  className="px-4 py-2 text-xs font-semibold text-zinc-600 border border-zinc-200 rounded-xl hover:bg-zinc-50 cursor-pointer"
                >
                  Explore Other Positions
                </button>
                <button
                  onClick={resetSubmissionFlow}
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 cursor-pointer"
                >
                  View My Applications
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. CANDIDATE APPLIED STATUS LEDGER */}
      {activeTab === 'my-applications' && (
        <div className="space-y-6">
          <PageHeader
            title="My Screenings"
            description="Track real-time matching, evaluation status, and recruiter comments."
            badge={`${myApplications.length} Submissions`}
          />

          <div className="space-y-4">
            <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block pl-1">
              My Applied Positions ({myApplications.length})
            </span>

            {myApplications.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {myApplications.map(app => {
                  const job = getJobDetails(app.jobId);

                  return (
                    <div
                      key={app.id}
                      className="border border-slate-200 dark:border-zinc-800 rounded-xl p-4 bg-white dark:bg-zinc-900 shadow-xs flex flex-col md:flex-row justify-between gap-3.5 text-left hover:border-indigo-300 dark:hover:border-zinc-700 transition duration-150"
                    >
                      <div className="space-y-1.5 flex-grow">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                          <h4 className="text-xs font-semibold text-slate-800 dark:text-zinc-50 leading-none">
                            {job?.title || 'Unknown Position'}
                          </h4>
                          <span className="text-[10px] font-medium text-slate-400 dark:text-zinc-500">
                            {job?.department || 'Engineering'}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-300" />
                            Applied on {app.appliedDate}
                          </span>
                          <span className="flex items-center gap-1 font-semibold text-indigo-505 bg-indigo-50/40 dark:bg-zinc-800/80 px-1.5 py-0.2 rounded text-[10px]">
                            <Layers className="w-3 h-3 text-indigo-500" />
                            AI Match: {app.matchPercentage}%
                          </span>
                        </div>

                        {/* Recruiter feedback helper block */}
                        <div className="mt-2.5 bg-slate-50/50 dark:bg-[#121214] border border-slate-100 dark:border-zinc-850 p-2.5 rounded-lg">
                          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Recruiter Comments</span>
                          <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed italic">
                            {app.status === 'Interviewing'
                              ? "Excellent profile scorecard! The recruiter team has selected your credentials and invited you to a video diagnostic session."
                              : app.status === 'Accepted'
                                ? "Congratulations! You have received a formal hire offer. Look out for welcome packages forwarded to your email."
                                : app.status === 'Declined'
                                  ? "Thank you for participating in our match diagnostic. The requirements for this specific role have been satisfied by alternative profiles."
                                  : "Document parser has matched your skill points. Your resume is placed in queue awaiting recruiter screener audits."}
                          </p>
                        </div>
                      </div>

                      {/* Matching details & Badge indicators */}
                      <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3 border-t md:border-t-0 border-slate-100 pt-2.5 md:pt-0">
                        <MatchBadge percentage={app.matchPercentage} />

                        <div className="flex items-center gap-1 text-[11px]">
                          {app.status === 'Interviewing' ? (
                            <span className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-0.5 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded">
                              <Clock className="w-3.5 h-3.5 animate-pulse text-indigo-500" />
                              Active call
                            </span>
                          ) : app.status === 'Accepted' ? (
                            <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                              Offer received
                            </span>
                          ) : app.status === 'Declined' ? (
                            <span className="font-bold text-rose-500 bg-rose-50/70 dark:bg-rose-950/20 px-2 py-0.5 rounded">
                              Archived
                            </span>
                          ) : (
                            <span className="font-semibold text-slate-500 dark:text-zinc-400 flex items-center gap-0.5 bg-slate-100 dark:bg-zinc-800 px-2.5 py-0.5 rounded">
                              In Screener
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                title="No Screenings Initiated"
                description="Explore open engineering or design careers and file submittals to test our matching indexes."
                actionText="Explore Positions"
                onActionClick={() => setActiveTab('explore')}
              />
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
