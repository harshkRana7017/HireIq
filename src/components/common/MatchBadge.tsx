import React from 'react';

interface MatchBadgeProps {
  percentage: number;
  id?: string;
}

export const MatchBadge: React.FC<MatchBadgeProps> = ({ percentage, id }) => {
  let bgClass = '';
  let textClass = '';
  let label = '';

  if (percentage < 50) {
    bgClass = 'bg-rose-50/70 border border-rose-100 dark:bg-rose-950/20 dark:border-rose-900/30';
    textClass = 'text-rose-600 dark:text-rose-400';
    label = 'Low Match';
  } else if (percentage < 80) {
    bgClass = 'bg-amber-50/70 border border-amber-100 dark:bg-amber-950/20 dark:border-amber-900/30';
    textClass = 'text-amber-600 dark:text-amber-400';
    label = 'Moderate Match';
  } else {
    bgClass = 'bg-emerald-50/70 border border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/30';
    textClass = 'text-emerald-600 dark:text-emerald-400';
    label = 'Strong Match';
  }

  return (
    <span
      id={id || `match-badge-${percentage}`}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${bgClass} ${textClass}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse md:inline-block" />
      {label} ({percentage}%)
    </span>
  );
};
