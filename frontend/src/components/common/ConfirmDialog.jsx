import React from 'react';
import { motion } from 'framer-motion';
import Modal from './Modal';
import Button from './Button';
import { FiAlertTriangle } from 'react-icons/fi';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', isLoading = false, variant = 'danger' }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={null} maxWidth="max-w-md">
      <div className="flex items-start gap-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
            variant === 'danger' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
          }`}
        >
          <FiAlertTriangle className="h-6 w-6" />
        </motion.div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <p className="mt-2 text-sm text-slate-500 leading-relaxed">{message}</p>
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
        <Button variant="secondary" onClick={onClose} disabled={isLoading} size="md">
          Cancel
        </Button>
        <Button variant={variant === 'danger' ? 'danger' : 'primary'} onClick={onConfirm} isLoading={isLoading} size="md">
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
