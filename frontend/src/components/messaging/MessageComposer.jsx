import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';

export default function MessageComposer({ onSend, disabled = false }) {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    // Auto focus on mount
    textareaRef.current?.focus();
  }, []);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending || disabled) return;

    setSending(true);
    try {
      await onSend(trimmed);
      setText('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e) => {
    setText(e.target.value);
    // Auto adjust height up to 120px
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  };

  return (
    <div className="p-4 border-t border-slate-200/80 bg-white">
      <div className="flex items-end gap-2.5 rounded-2xl border border-slate-200/90 bg-slate-50/70 p-2 focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500/15 transition-all">
        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Type your message... (Shift + Enter for new line)"
          disabled={disabled || sending}
          className="flex-1 max-h-28 resize-none bg-transparent px-2 py-1.5 text-sm text-slate-900 placeholder-slate-400 outline-none leading-relaxed"
        />

        <button
          type="button"
          onClick={handleSend}
          disabled={!text.trim() || sending || disabled}
          className={`shrink-0 flex items-center justify-center h-9 w-9 rounded-xl transition-all duration-150 ${
            text.trim() && !sending && !disabled
              ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-sm shadow-indigo-200 hover:from-indigo-700 hover:to-blue-700 active:scale-95'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
          aria-label="Send message"
        >
          {sending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send size={16} className="-ml-0.5" />
          )}
        </button>
      </div>
      <div className="mt-1.5 px-1 flex justify-between items-center text-[10px] text-slate-400 font-medium">
        <span>TEEROP Secure Communication</span>
        <span>Enter to send • Shift + Enter for newline</span>
      </div>
    </div>
  );
}
