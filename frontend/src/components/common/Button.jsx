import React from 'react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import { CgSpinner } from 'react-icons/cg';

const Button = React.forwardRef(
  ({ children, variant = 'primary', size = 'md', className, isLoading, disabled, type = 'button', icon: Icon, fullWidth, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none";

    const variants = {
      primary: "bg-gradient-to-br from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 hover:from-indigo-700 hover:to-blue-700 focus:ring-indigo-500",
      secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 focus:ring-indigo-500 shadow-sm",
      danger: "bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-md shadow-red-500/20 hover:shadow-lg hover:shadow-red-500/30 hover:from-red-600 hover:to-rose-700 focus:ring-red-500",
      ghost: "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-400",
      outline: "bg-transparent text-indigo-600 border-2 border-indigo-500 hover:bg-indigo-50 focus:ring-indigo-500",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-xs rounded-lg gap-1.5",
      md: "px-4 py-2.5 text-sm rounded-xl gap-2",
      lg: "px-6 py-3 text-base rounded-xl gap-2.5",
    };

    return (
      <motion.button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        whileHover={!(disabled || isLoading) ? { scale: 1.01 } : undefined}
        whileTap={!(disabled || isLoading) ? { scale: 0.98 } : undefined}
        className={clsx(baseStyles, variants[variant], sizes[size], fullWidth && "w-full", className)}
        {...props}
      >
        {isLoading ? (
          <CgSpinner className="animate-spin h-4 w-4" />
        ) : (
          Icon && <Icon className={clsx("h-4 w-4", children ? "shrink-0" : "")} />
        )}
        {isLoading && children ? <span className="opacity-70">{children}</span> : children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
