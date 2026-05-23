import React from 'react';

interface LoadingSkeletonProps {
  type?: 'card' | 'list' | 'dashboard' | 'scorecard';
  count?: number;
  id?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  type = 'card',
  count = 1,
  id
}) => {
  const items = Array.from({ length: count });

  if (type === 'list') {
    return (
      <div id={id || "loading-skeleton-list"} className="space-y-3 w-full">
        {items.map((_, i) => (
          <div
            key={i}
            className="flex items-center space-x-4 p-4 border border-zinc-100 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950/20"
          >
            <div className="rounded-full bg-zinc-200 dark:bg-zinc-800 h-10 w-10 animate-pulse" />
            <div className="flex-1 space-y-2 py-1">
              <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-1/4 animate-pulse" />
              <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'scorecard') {
    return (
      <div id={id || "loading-skeleton-scorecard"} className="border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 bg-white dark:bg-zinc-900/40 animate-pulse w-full">
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div className="w-28 h-28 rounded-full bg-zinc-200 dark:bg-zinc-800 flex-shrink-0" />
          <div className="flex-grow space-y-4 w-full">
            <div className="h-5 bg-zinc-200 dark:bg-zinc-800 rounded w-1/3" />
            <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-5/6" />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-2/3" />
                <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded w-full" />
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-2/3" />
                <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      id={id || "loading-skeleton-grid"}
      className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 w-full"
    >
      {items.map((_, i) => (
        <div
          key={i}
          className="border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 bg-white dark:bg-zinc-900/40 space-y-4 animate-pulse"
        >
          <div className="flex justify-between items-center">
            <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2" />
            <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded-full w-12" />
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-5/6" />
            <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-4/5" />
          </div>
          <div className="flex items-center space-x-2 pt-2">
            <div className="h-5 bg-zinc-200 dark:bg-zinc-800 rounded w-16" />
            <div className="h-5 bg-zinc-200 dark:bg-zinc-800 rounded w-16" />
            <div className="h-5 bg-zinc-200 dark:bg-zinc-800 rounded w-16" />
          </div>
          <div className="border-t border-zinc-100 dark:border-zinc-800/60 pt-4 flex justify-between">
            <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-1/4" />
            <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
};
