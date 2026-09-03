import React from 'react';
import { ArrowLeft, Briefcase, Building2, CheckCircle2 } from 'lucide-react';

export default function ChatHeader({
  conversation,
  isRecruiter,
  onBack,
}) {
  if (!conversation) return null;

  const title = isRecruiter
    ? conversation.candidate_name || 'Candidate'
    : conversation.recruiter_name || 'Hiring Recruiter';

  const roleLabel = isRecruiter ? 'Applicant' : 'Recruiter / HR';
  const jobTitle = conversation.job_title || 'Position';
  const company = conversation.company_name;

  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
      <div className="flex items-center gap-3">
        {onBack && (
          <button
            onClick={onBack}
            className="md:hidden p-1.5 -ml-1.5 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors"
            aria-label="Back to conversations"
          >
            <ArrowLeft size={18} />
          </button>
        )}

        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 leading-tight">
              {title}
            </h3>
            <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700 border border-indigo-100">
              {roleLabel}
            </span>
          </div>

          <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
            <span className="flex items-center gap-1 font-medium text-slate-600">
              <Briefcase size={13} className="text-slate-400" />
              {jobTitle}
            </span>
            {company && (
              <span className="flex items-center gap-1 font-medium text-slate-600">
                <Building2 size={13} className="text-slate-400" />
                {company}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-100">
          <CheckCircle2 size={12} className="text-emerald-500" />
          <span className="capitalize">{conversation.status || 'Active'}</span>
        </span>
      </div>
    </div>
  );
}
