import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  actionText?: string;
  onActionClick?: () => void;
  id?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon: Icon = Inbox,
  actionText,
  onActionClick,
  id
}) => {
  return (
    <div
      id={id || `empty-state-${title.toLowerCase().replace(/\s+/g, '-')}`}
      className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/10 max-w-lg mx-auto"
    >
      <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800/60 text-zinc-400 dark:text-zinc-500 mb-4 ring-4 ring-zinc-50 dark:ring-zinc-900/45">
        <Icon className="w-8 h-8 stroke-[1.5]" />
      </div>
      <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-50 tracking-tight">
        {title}
      </h3>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 max-w-sm">
        {description}
      </p>
      {actionText && onActionClick && (
        <button
          onClick={onActionClick}
          className="mt-5 inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-zinc-950 dark:text-zinc-50 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-850 transition-colors pointer-cursor"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
