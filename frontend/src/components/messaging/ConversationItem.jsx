import React from 'react';
import { Briefcase, Clock } from 'lucide-react';

function formatTimestamp(ts) {
  if (!ts) return '';
  const date = new Date(ts);
  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export default function ConversationItem({
  conversation,
  isSelected,
  onClick,
  isRecruiter,
}) {
  const title = isRecruiter
    ? conversation.candidate_name || 'Applicant'
    : conversation.recruiter_name || 'Hiring Team / Recruiter';

  const subtitle = conversation.job_title || 'Application';
  const company = !isRecruiter && conversation.company_name ? conversation.company_name : null;

  const initials = title
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase() || 'U';

  const timeDisplay = formatTimestamp(conversation.last_message_at || conversation.created_at);

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
      className={`group relative flex items-start gap-3.5 p-4 rounded-2xl cursor-pointer transition-all duration-200 border ${
        isSelected
          ? 'bg-indigo-50/90 border-indigo-200 shadow-sm'
          : 'bg-white hover:bg-slate-50 border-slate-100 hover:border-slate-200'
      }`}
    >
      {/* Avatar with status indicator */}
      <div className="relative shrink-0">
        <div
          className={`h-11 w-11 rounded-2xl flex items-center justify-center font-bold text-sm tracking-tight shadow-sm ${
            isSelected
              ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white shadow-indigo-200'
              : 'bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 group-hover:from-indigo-100 group-hover:to-blue-100 group-hover:text-indigo-700'
          } transition-all`}
        >
          {initials}
        </div>
        {conversation.unread_count > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-xs">
            {conversation.unread_count > 9 ? '9+' : conversation.unread_count}
          </span>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-1 mb-0.5">
          <h4
            className={`text-sm font-semibold truncate ${
              isSelected ? 'text-indigo-950' : 'text-slate-900'
            }`}
          >
            {title}
          </h4>
          {timeDisplay && (
            <span className="text-[11px] font-medium text-slate-400 shrink-0 flex items-center gap-1">
              <Clock size={11} className="opacity-70" />
              {timeDisplay}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1 truncate">
          <Briefcase size={12} className="shrink-0 text-slate-400" />
          <span className="truncate">
            {subtitle}
            {company ? ` • ${company}` : ''}
          </span>
        </div>

        <p
          className={`text-xs truncate ${
            conversation.unread_count > 0
              ? 'font-semibold text-slate-900'
              : 'text-slate-500 font-normal'
          }`}
        >
          {conversation.last_message || 'Conversation started'}
        </p>
      </div>
    </div>
  );
}
