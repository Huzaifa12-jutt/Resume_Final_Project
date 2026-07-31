import React from 'react';
import { clsx } from 'clsx';
import { CgSpinner } from 'react-icons/cg';

const Loader = ({ size = 'md', className, fullScreen = false, label }) => {
  const sizes = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-[3px]",
    lg: "h-12 w-12 border-4",
    xl: "h-16 w-16 border-4",
  };

  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <div className={clsx("rounded-full border-indigo-200 border-t-indigo-600 animate-spin", sizes[size], className)} />
      {label && <p className="text-xs font-medium text-slate-400">{label}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50">
        {spinner}
      </div>
    );
  }

  return <div className="flex justify-center items-center p-6">{spinner}</div>;
};

export default Loader;
