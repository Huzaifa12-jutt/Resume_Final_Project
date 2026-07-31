import React from 'react';
import { motion } from 'framer-motion';
import Button from './Button';

const EmptyState = ({ icon: Icon, title, description, actionText, onAction, secondaryText, onSecondary }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center py-12 px-6 text-center rounded-2xl border border-dashed border-slate-200 bg-white/50"
    >
      {Icon && (
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 text-indigo-500 mb-5 shadow-sm">
          <Icon className="h-8 w-8" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      {description && (
        <p className="mt-1.5 text-sm text-slate-500 max-w-sm leading-relaxed">{description}</p>
      )}
      <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
        {actionText && onAction && (
          <Button onClick={onAction} variant="primary" size="md">
            {actionText}
          </Button>
        )}
        {secondaryText && onSecondary && (
          <Button onClick={onSecondary} variant="secondary" size="md">
            {secondaryText}
          </Button>
        )}
      </div>
    </motion.div>
  );
};

export default EmptyState;
