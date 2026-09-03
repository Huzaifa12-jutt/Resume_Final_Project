import React, { useState } from 'react';
import { Search, MessageSquare, Loader2 } from 'lucide-react';
import ConversationItem from './ConversationItem';

export default function ConversationList({
  conversations = [],
  selectedId,
  onSelect,
  isRecruiter,
  loading = false,
}) {
  const [search, setSearch] = useState('');

  const filtered = conversations.filter((c) => {
    const term = search.toLowerCase();
    const candidate = (c.candidate_name || '').toLowerCase();
    const recruiter = (c.recruiter_name || '').toLowerCase();
    const job = (c.job_title || '').toLowerCase();
    const company = (c.company_name || '').toLowerCase();
    return (
      candidate.includes(term) ||
      recruiter.includes(term) ||
      job.includes(term) ||
      company.includes(term)
    );
  });

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200/80">
      {/* Search Header */}
      <div className="p-4 border-b border-slate-100">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              isRecruiter ? 'Search candidate or job...' : 'Search recruiter or job...'
            }
            className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-3.5 py-2 text-xs font-medium text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/15"
          />
        </div>
      </div>

      {/* List Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-400 text-xs">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-500 mb-2" />
            <span>Loading conversations...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-52 text-center p-4">
            <div className="h-10 w-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-2.5">
              <MessageSquare size={18} />
            </div>
            <p className="text-xs font-semibold text-slate-700">No conversations</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {search
                ? 'No matches found for your search.'
                : 'Conversations will appear here once messaging starts.'}
            </p>
          </div>
        ) : (
          filtered.map((c) => (
            <ConversationItem
              key={c.id}
              conversation={c}
              isSelected={selectedId === c.id}
              onClick={() => onSelect(c)}
              isRecruiter={isRecruiter}
            />
          ))
        )}
      </div>
    </div>
  );
}
