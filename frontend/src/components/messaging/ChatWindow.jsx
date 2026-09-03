import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Loader2, MessageSquare, AlertCircle } from 'lucide-react';
import ChatHeader from './ChatHeader';
import MessageBubble from './MessageBubble';
import MessageComposer from './MessageComposer';
import { messagingService } from '../../services/messagingService';
import toast from 'react-hot-toast';

const POLL_INTERVAL = 3500; // 3.5 seconds

export default function ChatWindow({
  conversation,
  currentUser,
  isRecruiter,
  onBack,
  onMessageSent,
}) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const isFirstLoadRef = useRef(true);

  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? 'smooth' : 'auto',
    });
  }, []);

  // Fetch messages function
  const fetchMessages = useCallback(
    async (isBackground = false) => {
      if (!conversation?.id) return;
      try {
        if (!isBackground) {
          setLoading(true);
          setError(null);
        }
        const data = await messagingService.getMessages(conversation.id);
        setMessages((prev) => {
          // If different length or last message ID changed, update
          const isChanged =
            prev.length !== data.length ||
            (data.length > 0 && prev[prev.length - 1]?.id !== data[data.length - 1]?.id);

          if (isChanged || !isBackground) {
            return data;
          }
          return prev;
        });

        // Mark as read if user is viewing conversation
        await messagingService.markConversationRead(conversation.id);
      } catch (err) {
        console.error('Error loading messages:', err);
        if (!isBackground) {
          setError('Failed to load messages. Please try again.');
        }
      } finally {
        if (!isBackground) {
          setLoading(false);
        }
      }
    },
    [conversation?.id]
  );

  // Initial load when conversation changes
  useEffect(() => {
    isFirstLoadRef.current = true;
    if (conversation?.id) {
      fetchMessages(false).then(() => {
        scrollToBottom(false);
      });
    }
  }, [conversation?.id, fetchMessages, scrollToBottom]);

  // Scroll to bottom after messages update if it's first load or near bottom
  useEffect(() => {
    if (!loading && messages.length > 0) {
      scrollToBottom(isFirstLoadRef.current ? false : true);
      isFirstLoadRef.current = false;
    }
  }, [messages, loading, scrollToBottom]);

  // Polling interval
  useEffect(() => {
    if (!conversation?.id) return;

    const timer = setInterval(() => {
      fetchMessages(true);
    }, POLL_INTERVAL);

    return () => clearInterval(timer);
  }, [conversation?.id, fetchMessages]);

  // Send message handler
  const handleSendMessage = async (text) => {
    if (!conversation?.id) return;
    try {
      const newMsg = await messagingService.sendMessage(conversation.id, text);
      setMessages((prev) => [...prev, newMsg]);
      scrollToBottom(true);
      onMessageSent?.(conversation.id, text);
    } catch (err) {
      toast.error(err.message || 'Failed to send message');
      throw err;
    }
  };

  if (!conversation) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-50/50 p-8 text-center">
        <div className="h-16 w-16 rounded-3xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500 mb-4 shadow-sm">
          <MessageSquare size={28} />
        </div>
        <h3 className="text-base font-bold text-slate-900">No conversation selected</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm">
          Select a conversation from the left to start messaging, or reach out to applicants directly from your dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50/30">
      {/* Header */}
      <ChatHeader
        conversation={conversation}
        isRecruiter={isRecruiter}
        onBack={onBack}
      />

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs">
            <Loader2 className="h-7 w-7 animate-spin text-indigo-600 mb-2" />
            <span>Loading conversation...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <AlertCircle className="h-8 w-8 text-rose-500 mb-2" />
            <p className="text-sm font-semibold text-slate-800">{error}</p>
            <button
              onClick={() => fetchMessages(false)}
              className="mt-3 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Try Again
            </button>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-3">
              <MessageSquare size={22} />
            </div>
            <p className="text-sm font-bold text-slate-800">Start the conversation</p>
            <p className="text-xs text-slate-500 mt-1 max-w-xs">
              Send a message regarding the application for{' '}
              <span className="font-semibold text-slate-700">
                {conversation.job_title || 'this role'}
              </span>
              .
            </p>
          </div>
        ) : (
          <div>
            {messages.map((m) => (
              <MessageBubble
                key={m.id}
                message={m}
                isOwn={m.sender_id === currentUser?.id}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Composer */}
      <MessageComposer onSend={handleSendMessage} disabled={loading} />
    </div>
  );
}
