import React from 'react';
import { MatchAnalysis } from '../../types';
import { Check, AlertTriangle, HelpCircle, FileText } from 'lucide-react';

interface MatchScoreCardProps {
  percentage: number;
  id?: string;
  analysis: MatchAnalysis;
  candidateName: string;
}

export const MatchScoreCard: React.FC<MatchScoreCardProps> = ({
  percentage,
  id,
  analysis,
  candidateName
}) => {
  // SVG Circular progress Math
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  let strokeColor = 'stroke-amber-500';
  let textColor = 'text-amber-600 dark:text-amber-400';
  let trackColor = 'stroke-amber-100 dark:stroke-amber-950/40';
  let bgGradient = 'from-amber-500/5 to-transparent';

  if (percentage < 50) {
    strokeColor = 'stroke-rose-500';
    textColor = 'text-rose-600 dark:text-rose-400';
    trackColor = 'stroke-rose-100 dark:stroke-rose-950/40';
    bgGradient = 'from-rose-500/5 to-transparent';
  } else if (percentage >= 80) {
    strokeColor = 'stroke-emerald-500';
    textColor = 'text-emerald-600 dark:text-emerald-400';
    trackColor = 'stroke-emerald-100 dark:stroke-emerald-950/40';
    bgGradient = 'from-emerald-500/5 to-transparent';
  }

  return (
    <div
      id={id || `match-scorecard-${candidateName.replace(/\s+/g, '-').toLowerCase()}`}
      className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800/80 rounded-xl p-4.5 shadow-sm flex flex-col md:flex-row gap-5 items-center"
    >
      {/* Percentage Circle Visualizer */}
      <div className="flex-shrink-0 flex flex-col items-center justify-center p-3.5 bg-slate-50/50 dark:bg-zinc-850 rounded-xl border border-slate-100 dark:border-zinc-800/50 w-full md:w-36 text-center">
        <span className="text-[10px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-2">Match Score</span>
        <div className="relative w-24 h-24 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="48"
              cy="48"
              r={radius}
              className={`${trackColor} fill-transparent`}
              strokeWidth="7"
            />
            {/* Foreground circle */}
            <circle
              cx="48"
              cy="48"
              r={radius}
              className={`${strokeColor} fill-transparent transition-all duration-1000 ease-out`}
              strokeWidth="7"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className={`text-2xl font-bold tracking-tight ${textColor}`}>
              {percentage}%
            </span>
          </div>
        </div>
        <span className={`text-[10px] font-semibold mt-2.5 px-2 py-0.5 rounded-full bg-white dark:bg-zinc-800 shadow-xs ${textColor}`}>
          {percentage >= 80 ? 'Strong' : percentage >= 50 ? 'Moderate' : 'Low'} Match
        </span>
      </div>

      {/* Dynamic Skill Alignment Panels */}
      <div className="flex-grow w-full flex flex-col gap-3">
        {/* Summary Block */}
        <div>
          <h4 className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-zinc-100">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            AI Scorecard Summary
          </h4>
          <p className="mt-1 text-xs text-slate-600 dark:text-zinc-400 leading-relaxed border-l-2 border-indigo-500/30 pl-2.5">
            {analysis.summary}
          </p>
        </div>

        {/* Skills Matched / Missing Rows */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-3 border-t border-slate-100 dark:border-zinc-800/50">
          {/* Matched Skills */}
          <div>
            <span className="text-[10px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block mb-1.5">
              Matched Tech ({analysis.matchedSkills.length})
            </span>
            {analysis.matchedSkills.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {analysis.matchedSkills.map(skill => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-0.5 text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100/50 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded"
                  >
                    <Check className="w-2.5 h-2.5" />
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-[10px] text-slate-400 italic">No overlapping skills detected</span>
            )}
          </div>

          {/* Missing Skills */}
          <div>
            <span className="text-[10px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block mb-1.5">
              Missing Target Criteria ({analysis.missingSkills.length})
            </span>
            {analysis.missingSkills.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {analysis.missingSkills.map(skill => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-0.5 text-[10px] font-medium bg-rose-50 dark:bg-rose-950/20 border border-rose-100/50 dark:border-rose-900/30 text-rose-700 dark:text-rose-400 px-1.5 py-0.5 rounded"
                  >
                    <AlertTriangle className="w-2.5 h-2.5" />
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 italic flex items-center gap-0.5 font-medium">
                <Check className="w-3 h-3 text-emerald-500" />
                All requirements achieved
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
