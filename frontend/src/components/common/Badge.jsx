import React from 'react';
import { clsx } from 'clsx';

const Badge = ({ children, variant = 'blue', className, dot = false, size = 'sm' }) => {
  const variants = {
    blue: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    yellow: 'bg-amber-50 text-amber-700 border-amber-200',
    red: 'bg-rose-50 text-rose-700 border-rose-200',
    gray: 'bg-slate-50 text-slate-600 border-slate-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  };

  const sizes = {
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-sm',
  };

  const dotColors = {
    blue: 'bg-indigo-500',
    green: 'bg-emerald-500',
    yellow: 'bg-amber-500',
    red: 'bg-rose-500',
    gray: 'bg-slate-400',
    purple: 'bg-purple-500',
    indigo: 'bg-indigo-500',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full font-medium border',
        sizes[size],
        variants[variant] || variants.blue,
        className
      )}
    >
      {dot && (
        <span className={clsx('mr-1.5 h-1.5 w-1.5 rounded-full', dotColors[variant] || dotColors.blue)} />
      )}
      {children}
    </span>
  );
};

export default Badge;
