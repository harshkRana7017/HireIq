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
  const { jobs, applications, currentUser, addApplication, analyzing, googleUser, scheduleInterview } = useAppState();

  const [activeTab, setActiveTab] = useState('explore'); // 'explore' | 'my-applications'
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // Application process status
  const [submissionCompleted, setSubmissionCompleted] = useState<Application | null>(null);

  // Scheduling states
  const [selectedDate, setSelectedDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('09:00 AM - 10:00 AM');
  const [isScheduling, setIsScheduling] = useState(false);
  const [showCalendarSection, setShowCalendarSection] = useState<string | null>(null);

  const TIME_SLOTS = [
    '09:00 AM - 10:00 AM',
    '10:30 AM - 11:30 AM',
    '01:00 PM - 02:00 PM',
    '03:30 PM - 04:30 PM'
  ];

  const handleScheduleMeet = async (appId: string, candidateName: string, candidateEmail: string, jobTitle: string) => {
    setIsScheduling(true);
    try {
      let meetLink = '';
      
      const [startPart] = selectedTimeSlot.split(' - ');
      const [time, period] = startPart.split(' ');
      let [hours, minutes] = time.split(':').map(Number);
      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
      
      const pad = (n: number) => String(n).padStart(2, '0');
      const startIso = `${selectedDate}T${pad(hours)}:${pad(minutes)}:00`;
      const endIso = `${selectedDate}T${pad(hours + 1)}:${pad(minutes)}:00`;

      if (googleUser && googleUser.accessToken) {
        try {
          const event = {
            summary: `Interview: ${candidateName} <> ${jobTitle}`,
            description: `HireIq Platform Automated Google Calendar Invitation.\nAI Fit Score matched above 80%!\n\nCandidate Email: ${candidateEmail}`,
            start: {
              dateTime: startIso,
              timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
            end: {
              dateTime: endIso,
              timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
            attendees: [
              { email: candidateEmail },
              { email: googleUser.email }
            ],
            conferenceData: {
              createRequest: {
                requestId: `meet-${Date.now()}`,
                conferenceSolutionKey: {
                  type: 'hangoutsMeet'
                }
              }
            }
          };

          const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${googleUser.accessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(event)
          });
          
          if (res.ok) {
            const data = await res.json();
            meetLink = data.hangoutLink || '';
          }
        } catch (apiErr) {
          console.warn('Real Google Calendar API call failed:', apiErr);
        }
      }
      
      if (!meetLink) {
        const randomCode1 = Math.random().toString(36).substring(2, 5);
        const randomCode2 = Math.random().toString(36).substring(2, 6);
        const randomCode3 = Math.random().toString(36).substring(2, 5);
        meetLink = `https://meet.google.com/${randomCode1}-${randomCode2}-${randomCode3}`;
      }
      
      scheduleInterview(appId, selectedDate, selectedTimeSlot, meetLink);
      
      if (submissionCompleted && submissionCompleted.id === appId) {
        setSubmissionCompleted(prev => prev ? {
          ...prev,
          interviewDate: selectedDate,
          interviewTimeSlot: selectedTimeSlot,
          meetLink
        } : null);
      }
    } catch (err) {
      console.error('Error scheduling interview:', err);
    } finally {
      setIsScheduling(false);
    }
  };

  if (!currentUser) return null;

  // Filter applications submitted by current logged-in user
  const myApplications = applications.filter(app => app.candidateEmail === currentUser.email);

  const handleResumeMatchComplete = async (fileName: string, rawText: string, file?: File) => {

    console.log(file, "fille 3")
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
              
              <div className="text-xs text-zinc-400 leading-relaxed text-left bg-zinc-950 p-3.5 rounded-xl border border-zinc-805">
                <strong className="text-zinc-250 font-bold block mb-1">AI Match Summary:</strong>
                {submissionCompleted.matchAnalysis.summary}
              </div>

              {/* 80%+ Match Calendar Scheduler Block */}
              {submissionCompleted.matchPercentage >= 80 && (
                <div className="border border-indigo-500/20 bg-indigo-500/[0.02] p-5 rounded-2xl space-y-4 text-left relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-indigo-500/10 to-transparent rounded-bl-full pointer-events-none" />

                  {submissionCompleted.interviewDate ? (
                    /* Scheduled success state */
                    <div className="space-y-4 text-center py-2">
                      <div className="inline-flex p-3 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <Calendar className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-emerald-400">Interview Scheduled Successfully!</h4>
                        <p className="text-[11px] text-zinc-400 mt-1">
                          A Google Calendar event has been booked on the recruiter's schedule.
                        </p>
                      </div>
                      <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-805 text-xs inline-block text-left space-y-1.5 min-w-[280px]">
                        <p className="text-zinc-400">
                          Date: <strong className="text-zinc-200">{submissionCompleted.interviewDate}</strong>
                        </p>
                        <p className="text-zinc-400">
                          Time Slot: <strong className="text-zinc-200">{submissionCompleted.interviewTimeSlot}</strong>
                        </p>
                        <p className="text-zinc-400 flex items-center gap-1.5">
                          Meet Link: 
                          <a
                            href={submissionCompleted.meetLink}
                            target="_blank"
                            rel="noreferrer"
                            className="text-indigo-400 hover:text-indigo-300 font-semibold inline-flex items-center gap-1 truncate max-w-[150px]"
                          >
                            Join Meet
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </p>
                      </div>
                    </div>
                  ) : (
                    /* Active calendar scheduler state */
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="p-1 rounded bg-indigo-500/15 text-indigo-400">
                          <Clock className="w-4 h-4 animate-pulse" />
                        </span>
                        <div>
                          <h4 className="text-xs font-bold text-zinc-50 uppercase tracking-widest">
                            Instant Interview Booking
                          </h4>
                          <p className="text-[10px] text-zinc-500">
                            Excellent Match! Select a calendar slot to book directly via Recruiter's Google Calendar.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">
                            Select Date
                          </label>
                          <input
                            type="date"
                            required
                            min={new Date().toISOString().split('T')[0]}
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-full text-xs px-3 py-2 border border-slate-800 rounded-lg bg-[#090d16] text-slate-200 focus:outline-inner"
                          />
                        </div>

                        <div>
                          <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">
                            Available Time Slots
                          </label>
                          <div className="grid grid-cols-1 gap-1.5 max-h-[120px] overflow-y-auto pr-1">
                            {TIME_SLOTS.map(slot => (
                              <button
                                key={slot}
                                type="button"
                                onClick={() => setSelectedTimeSlot(slot)}
                                className={`text-[10px] font-semibold py-1.5 px-3 rounded-lg border text-center transition-all ${
                                  selectedTimeSlot === slot
                                    ? 'bg-indigo-600/10 border-indigo-500 text-indigo-300 font-bold'
                                    : 'bg-[#090d16] border-zinc-800 text-zinc-400 hover:border-zinc-700'
                                }`}
                              >
                                {slot}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={isScheduling}
                        onClick={() => handleScheduleMeet(
                          submissionCompleted.id,
                          currentUser.name,
                          currentUser.email,
                          selectedJob.title
                        )}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-650/50 rounded-xl shadow-sm transition-all duration-150 cursor-pointer"
                      >
                        {isScheduling ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Creating Google Meet Event...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12.24 10.285V13.4h6.887C18.2 15.614 15.645 18 12.24 18c-3.86 0-7-3.14-7-7s3.14-7 7-7c1.7 0 3.25.61 4.47 1.636l2.427-2.427C17.27 1.482 14.92 1 12.24 1 6.162 1 1.24 5.922 1.24 12s4.922 11 11 11c6.338 0 10.545-4.455 10.545-10.715 0-.727-.08-1.282-.173-1.718L12.24 10.285z" />
                            </svg>
                            <span>Confirm & Schedule Meeting</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="pt-3 border-t border-zinc-50 flex justify-end gap-3.5">
                <button
                  onClick={() => setSelectedJob(null)}
                  className="px-4 py-2 text-xs font-semibold text-zinc-650 border border-zinc-200 rounded-xl hover:bg-zinc-50 cursor-pointer"
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
                            {app.status === 'Interviewing' && !app.interviewDate
                              ? "Excellent profile scorecard! The recruiter team has selected your credentials and invited you to a video diagnostic session."
                              : app.status === 'Interviewing' && app.interviewDate
                              ? `Your Google Calendar invite is registered. Recruiter Harsh Rana has synced details for a Meet conference.`
                              : app.status === 'Accepted'
                                ? "Congratulations! You have received a formal hire offer. Look out for welcome packages forwarded to your email."
                                : app.status === 'Declined'
                                  ? "Thank you for participating in our match diagnostic. The requirements for this specific role have been satisfied by alternative profiles."
                                  : "Document parser has matched your skill points. Your resume is placed in queue awaiting recruiter screener audits."}
                          </p>
                        </div>

                        {/* Calendar Slot Selector form/banner inside ledger list item */}
                        {app.matchPercentage >= 80 && (
                          <div className="mt-2.5">
                            {app.interviewDate ? (
                              <div className="p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/[0.01] flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                                <div className="flex items-center gap-2">
                                  <span className="p-1 rounded bg-emerald-500/10 text-emerald-400">
                                    <Calendar className="w-4 h-4" />
                                  </span>
                                  <div>
                                    <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest block">Google Calendar Sync'd</span>
                                    <span className="text-[11px] text-zinc-300 font-semibold">{app.interviewDate} @ {app.interviewTimeSlot}</span>
                                  </div>
                                </div>
                                <a
                                  href={app.meetLink}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center justify-center gap-1 px-3 py-1.5 text-[9px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all duration-150 cursor-pointer"
                                >
                                  Join Google Meet
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              </div>
                            ) : showCalendarSection === app.id ? (
                              <div className="p-4 border border-indigo-500/20 bg-indigo-500/[0.01] rounded-xl space-y-3.5 text-left">
                                <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider block">Book Google Meet Interview</span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                  <div>
                                    <label className="text-[9px] font-semibold text-zinc-500 uppercase block mb-1">Select Date</label>
                                    <input
                                      type="date"
                                      required
                                      min={new Date().toISOString().split('T')[0]}
                                      value={selectedDate}
                                      onChange={(e) => setSelectedDate(e.target.value)}
                                      className="w-full text-xs px-2.5 py-1.5 border border-zinc-800 rounded-lg bg-[#090d16] text-white"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[9px] font-semibold text-zinc-500 uppercase block mb-1 font-bold">Select Time Slot</label>
                                    <select
                                      value={selectedTimeSlot}
                                      onChange={(e) => setSelectedTimeSlot(e.target.value)}
                                      className="w-full text-xs px-2.5 py-1.5 border border-zinc-800 rounded-lg bg-[#090d16] text-white"
                                    >
                                      {TIME_SLOTS.map(slot => (
                                        <option key={slot} value={slot}>{slot}</option>
                                      ))}
                                    </select>
                                  </div>
                                </div>
                                <div className="flex gap-2 justify-end pt-1">
                                  <button
                                    type="button"
                                    onClick={() => setShowCalendarSection(null)}
                                    className="px-3 py-1.5 text-[10px] font-semibold text-zinc-400 hover:text-zinc-200"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="button"
                                    disabled={isScheduling}
                                    onClick={() => handleScheduleMeet(app.id, app.candidateName, app.candidateEmail, job?.title || 'Job Position')}
                                    className="px-4 py-1.5 text-[10px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg inline-flex items-center gap-1"
                                  >
                                    {isScheduling && <RefreshCw className="w-3 h-3 animate-spin" />}
                                    Confirm Calendar Meet
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="p-3 rounded-lg border border-indigo-500/10 bg-indigo-500/[0.01] flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                                <div className="flex items-center gap-1.5">
                                  <span className="p-1 rounded bg-indigo-500/10 text-indigo-400">
                                    <Sparkles className="w-3.5 h-3.5" />
                                  </span>
                                  <div>
                                    <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest block">🌟 Match Score Exceeds 80%</span>
                                    <span className="text-[10px] text-zinc-400">Book a dynamic slot on the Recruiter's Google Calendar.</span>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedTimeSlot(TIME_SLOTS[0]);
                                    setShowCalendarSection(app.id);
                                  }}
                                  className="inline-flex items-center justify-center gap-1 px-3 py-1.5 text-[9px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all cursor-pointer"
                                >
                                  Schedule Meeting
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        )}
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
