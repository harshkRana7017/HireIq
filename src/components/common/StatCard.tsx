import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    type: 'positive' | 'negative' | 'neutral';
  };
  color?: 'primary' | 'emerald' | 'amber' | 'rose' | 'indigo';
  id?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  icon: Icon,
  trend,
  color = 'primary',
  id
}) => {
  let iconBg = '';
  let iconText = '';
  let trendColor = '';

  if (color === 'indigo' || color === 'primary') {
    iconBg = 'bg-indigo-50/70 dark:bg-indigo-950/30';
    iconText = 'text-indigo-600 dark:text-indigo-400 border border-indigo-100/30 dark:border-indigo-900/10';
  } else if (color === 'emerald') {
    iconBg = 'bg-emerald-50/70 dark:bg-emerald-950/30';
    iconText = 'text-emerald-600 dark:text-emerald-400 border border-emerald-100/30 dark:border-emerald-900/10';
  } else if (color === 'amber') {
    iconBg = 'bg-amber-50/70 dark:bg-amber-950/30';
    iconText = 'text-amber-600 dark:text-amber-400 border border-amber-100/30 dark:border-amber-900/10';
  } else if (color === 'rose') {
    iconBg = 'bg-rose-50/70 dark:bg-rose-950/30';
    iconText = 'text-rose-600 dark:text-rose-400 border border-rose-100/30 dark:border-rose-900/10';
  }

  if (trend) {
    if (trend.type === 'positive') {
      trendColor = 'text-emerald-600 dark:text-emerald-400';
    } else if (trend.type === 'negative') {
      trendColor = 'text-rose-600 dark:text-rose-400';
    } else {
      trendColor = 'text-slate-500 dark:text-zinc-400';
    }
  }

  return (
    <div
      id={id || `stat-card-${title.toLowerCase().replace(/\s+/g, '-')}`}
      className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800/80 rounded-xl p-4 shadow-sm hover:shadow-xs transition-shadow duration-150 flex flex-col justify-between"
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-[10px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
            {title}
          </p>
          <h3 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-zinc-50 mt-1">
            {value}
          </h3>
        </div>
        <div className={`p-2 rounded-lg ${iconBg} ${iconText} flex items-center justify-center`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      {(description || trend) && (
        <div className="mt-3.5 flex items-center justify-between text-[11px] font-medium border-t border-slate-100 dark:border-zinc-800/40 pt-2.5">
          {trend && (
            <span className={trendColor}>
              {trend.value} <span className="text-slate-400 dark:text-zinc-500 font-normal">vs last month</span>
            </span>
          )}
          {description && (
            <span className="text-slate-500 dark:text-zinc-400 font-normal">
              {description}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
