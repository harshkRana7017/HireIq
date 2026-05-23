import React from 'react';
import { Application } from '../../types';
import { MatchBadge } from './MatchBadge';
import { FileText, Calendar, ChevronRight, User } from 'lucide-react';

interface CandidateCardProps {
  application: Application;
  jobTitle?: string;
  onClick: () => void;
  selected?: boolean;
  id?: string;
}

export const CandidateCard: React.FC<CandidateCardProps> = ({
  application,
  jobTitle,
  onClick,
  selected = false,
  id
}) => {
  // Format dates elegantly
  const formatDate = (dateString: string) => {
    try {
      const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch {
      return dateString;
    }
  };

  return (
    <div
      id={id || `candidate-card-${application.id}`}
      onClick={onClick}
      className={`border rounded-xl p-4 bg-white dark:bg-zinc-900 hover:border-indigo-300 dark:hover:border-zinc-700 hover:shadow-xs transition-all duration-150 cursor-pointer text-left flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 ${
        selected
          ? 'border-indigo-500 ring-4 ring-indigo-500/5 dark:ring-indigo-500/10 bg-indigo-50/10'
          : 'border-slate-200 dark:border-zinc-800'
      }`}
    >
      <div className="flex items-center gap-3.5 flex-grow">
        {/* Profile Avatar */}
        <div className="h-10 w-10 rounded-lg bg-slate-50 dark:bg-zinc-800/80 border border-slate-200/80 dark:border-zinc-800 flex items-center justify-center flex-shrink-0">
          <img
            src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(application.candidateName)}`}
            alt={application.candidateName}
            referrerPolicy="no-referrer"
            className="w-full h-full rounded-lg"
          />
        </div>

        {/* Identification & File */}
        <div className="space-y-0.5 overflow-hidden">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <h4 className="text-xs font-semibold text-slate-900 dark:text-zinc-50 truncate">
              {application.candidateName}
            </h4>
            {jobTitle && (
              <span className="text-[10px] font-medium text-slate-400 dark:text-zinc-500 truncate max-w-[140px]">
                for {jobTitle}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 font-medium truncate">
            <FileText className="w-3 h-3 flex-shrink-0 text-indigo-500" />
            <span className="truncate max-w-[160px]">{application.resumeFileName}</span>
          </div>

          <div className="flex items-center gap-1 text-[10px] text-slate-400 font-normal">
            <Calendar className="w-3 h-3 flex-shrink-0 text-slate-300" />
            <span>Applied on {formatDate(application.appliedDate)}</span>
          </div>
        </div>
      </div>

      {/* Matching Badge & Selection Actions */}
      <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 border-t sm:border-t-0 border-slate-100 pt-2.5 sm:pt-0">
        <MatchBadge percentage={application.matchPercentage} />
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors cursor-pointer"
        >
          Analysis & Scorecard
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
