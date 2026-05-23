import React from 'react';
import { Job } from '../../types';
import { Briefcase, MapPin, DollarSign, Calendar, Users, Eye } from 'lucide-react';

interface JobCardProps {
  job: Job;
  onClick?: () => void;
  actionText?: string;
  onActionClick?: (e: React.MouseEvent) => void;
  id?: string;
  selected?: boolean;
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  onClick,
  actionText,
  onActionClick,
  id,
  selected = false
}) => {
  return (
    <div
      id={id || `job-card-${job.id}`}
      onClick={onClick}
      className={`border rounded-xl p-4.5 hover:border-indigo-300 dark:hover:border-zinc-700 hover:shadow-xs transition-all duration-150 cursor-pointer text-left bg-white dark:bg-zinc-900 ${
        selected
          ? 'border-indigo-500 ring-4 ring-indigo-500/5 dark:ring-indigo-500/10 bg-indigo-50/10'
          : 'border-slate-200 dark:border-zinc-800'
      }`}
    >
      <div className="flex justify-between items-start gap-2.5">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-50 tracking-tight hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            {job.title}
          </h3>
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-1 text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
            <span className="flex items-center gap-1">
              <Briefcase className="w-3 h-3 text-slate-400" />
              {job.department}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-400" />
              {job.location}
            </span>
            <span className="flex items-center gap-1 bg-slate-105/90 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300 px-1.5 py-0.5 rounded text-[10px] font-semibold">
              {job.type}
            </span>
          </div>
        </div>
      </div>

      <p className="mt-2.5 text-xs text-slate-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
        {job.description}
      </p>

      {/* Required Skills Grid */}
      <div className="mt-3 flex flex-wrap gap-1">
        {job.skills.map(skill => (
          <span
            key={skill}
            className="text-[9px] font-semibold bg-indigo-50/50 text-indigo-700 border border-indigo-100/60 dark:bg-zinc-800 dark:text-indigo-300 px-1.5 py-0.5 rounded"
          >
            {skill}
          </span>
        ))}
      </div>

      <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-zinc-800/60 flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-zinc-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-slate-600">
            <DollarSign className="w-3 h-3 text-slate-400" />
            {job.salary}
          </span>
          <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50/40 px-1.5 py-0.5 rounded">
            <Users className="w-3 h-3 text-indigo-500" />
            {job.applicantsCount} {job.applicantsCount === 1 ? 'applicant' : 'applicants'}
          </span>
        </div>

        {actionText && onActionClick && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onActionClick(e);
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            {actionText}
          </button>
        )}
      </div>
    </div>
  );
};
