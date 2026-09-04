import React from 'react';

/**
 * Standardized status badge for candidate and application workflows across TEEROP.
 */
const STATUS_CONFIG = {
  applied: {
    label: 'Applied',
    className: 'bg-sky-50 text-sky-700 border-sky-200',
    dotColor: 'bg-sky-500',
  },
  'under review': {
    label: 'Under Review',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
    dotColor: 'bg-amber-500',
  },
  under_review: {
    label: 'Under Review',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
    dotColor: 'bg-amber-500',
  },
  shortlisted: {
    label: 'Shortlisted',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dotColor: 'bg-emerald-500',
  },
  interview: {
    label: 'Interview',
    className: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    dotColor: 'bg-indigo-500',
  },
  interviewing: {
    label: 'Interviewing',
    className: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    dotColor: 'bg-indigo-500',
  },
  accepted: {
    label: 'Accepted',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dotColor: 'bg-emerald-500',
  },
  hired: {
    label: 'Hired',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dotColor: 'bg-emerald-500',
  },
  rejected: {
    label: 'Rejected',
    className: 'bg-rose-50 text-rose-700 border-rose-200',
    dotColor: 'bg-rose-500',
  },
  active: {
    label: 'Active',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dotColor: 'bg-emerald-500',
  },
  archived: {
    label: 'Archived',
    className: 'bg-slate-50 text-slate-600 border-slate-200',
    dotColor: 'bg-slate-400',
  },
  draft: {
    label: 'Draft',
    className: 'bg-slate-50 text-slate-600 border-slate-200',
    dotColor: 'bg-slate-400',
  },
  closed: {
    label: 'Closed',
    className: 'bg-rose-50 text-rose-700 border-rose-200',
    dotColor: 'bg-rose-500',
  },
};

export default function StatusBadge({ status, className = '', dot = true, size = 'sm' }) {
  const normalized = (status || '').toLowerCase().trim();
  const config = STATUS_CONFIG[normalized] || {
    label: status || 'Unknown',
    className: 'bg-slate-50 text-slate-700 border-slate-200',
    dotColor: 'bg-slate-400',
  };

  const sizeClasses = size === 'sm'
    ? 'px-2.5 py-0.5 text-xs font-semibold'
    : 'px-3 py-1 text-xs sm:text-sm font-semibold';

  return (
    <span
      className={`inline-flex items-center rounded-full border ${sizeClasses} ${config.className} ${className}`}
    >
      {dot && (
        <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${config.dotColor}`} />
      )}
      {config.label}
    </span>
  );
}
