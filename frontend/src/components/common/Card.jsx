import React from 'react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

const Card = React.forwardRef(({ className, children, hoverable = false, glass = false, padding = true, ...props }, ref) => {
  const baseStyles = "bg-white rounded-2xl border border-slate-200/80 shadow-premium overflow-hidden";
  const glassStyles = glass
    ? "bg-white/80 backdrop-blur-xl border-white/60 shadow-premium-lg"
    : "";
  const hoverStyles = hoverable
    ? "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-premium-lg hover:border-slate-300 cursor-pointer"
    : "";
  const paddingStyles = padding ? "p-5 sm:p-6" : "";

  return (
    <motion.div
      ref={ref}
      initial={hoverable ? { opacity: 0, y: 12 } : undefined}
      animate={hoverable ? { opacity: 1, y: 0 } : undefined}
      className={clsx(baseStyles, glassStyles, hoverStyles, paddingStyles, className)}
      {...props}
    >
      {children}
    </motion.div>
  );
});

Card.displayName = 'Card';
export default Card;
