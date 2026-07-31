import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCalendar, FiTrash2 } from 'react-icons/fi';
import Button from '../common/Button';

const DashboardHeader = ({ job, onDelete }) => {
  const navigate = useNavigate();

  const formattedDate = job?.created_at
    ? new Date(job.created_at).toLocaleDateString(undefined, {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-premium mb-6">
      <div className="flex items-center justify-between gap-4 mb-4">
        <button
          onClick={() => navigate('/recruiter/jobs')}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-100"
        >
          <FiArrowLeft className="h-4 w-4" />
          Back to Jobs
        </button>

        <Button variant="danger" size="sm" icon={FiTrash2} onClick={onDelete}>
          Delete Job
        </Button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {job?.title || 'Job Dashboard'}
          </h1>
          {formattedDate && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
              <FiCalendar className="h-3.5 w-3.5" />
              <span>Created on {formattedDate}</span>
            </div>
          )}
        </div>
      </div>

      {job?.description && (
        <p className="mt-4 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
          {job.description}
        </p>
      )}
    </div>
  );
};

export default DashboardHeader;
