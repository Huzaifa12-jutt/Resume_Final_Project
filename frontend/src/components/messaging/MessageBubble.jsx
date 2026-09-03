import React from 'react';
import { Check, CheckCheck } from 'lucide-react';

function formatMessageTime(ts) {
  if (!ts) return '';
  const date = new Date(ts);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function MessageBubble({ message, isOwn }) {
  const time = formatMessageTime(message.created_at);

  return (
    <div
      className={`flex flex-col mb-3.5 ${
        isOwn ? 'items-end' : 'items-start'
      }`}
    >
      <div
        className={`relative max-w-[80%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-xs ${
          isOwn
            ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-tr-xs shadow-indigo-500/10'
            : 'bg-white border border-slate-200/90 text-slate-900 rounded-tl-xs shadow-slate-200/30'
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{message.message}</p>

        <div
          className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${
            isOwn ? 'text-indigo-100' : 'text-slate-400'
          }`}
        >
          <span>{time}</span>
          {isOwn && (
            <span>
              {message.is_read ? (
                <CheckCheck size={13} className="text-emerald-300 inline" />
              ) : (
                <Check size={13} className="text-indigo-200 inline" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
