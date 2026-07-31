import React, { useEffect, useRef } from 'react';
import { FiMessageSquare, FiX, FiRefreshCw } from 'react-icons/fi';
import ChatBubble from './ChatBubble';
import ChatInput from './ChatInput';
import Loader from '../common/Loader';
import useChat from '../../hooks/useChat';

const ChatWindow = ({ jobId, isOpen, onClose }) => {
  const { messages, isLoadingHistory, isSending, sendMessage, fetchHistory } = useChat(jobId);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-white shadow-2xl border-l border-gray-200 flex flex-col transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <FiMessageSquare className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">AI HR Assistant</h3>
            <p className="text-[10px] text-gray-500">Query candidates & rankings</p>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={fetchHistory}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            title="Refresh Chat History"
          >
            <FiRefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoadingHistory ? (
          <div className="py-12">
            <Loader size="md" />
          </div>
        ) : messages.length > 0 ? (
          messages.map((msg, index) => <ChatBubble key={msg.id || index} message={msg} />)
        ) : (
          <div className="text-center py-12 text-gray-400 space-y-2">
            <FiMessageSquare className="h-8 w-8 mx-auto text-gray-300" />
            <p className="text-sm font-medium">No conversation history yet</p>
            <p className="text-xs text-gray-400 max-w-xs mx-auto">
              Ask questions like "Who is the top candidate for python?" or "Summarize candidate experience".
            </p>
          </div>
        )}

        {/* Typing Indicator */}
        {isSending && (
          <div className="flex items-center space-x-2 text-xs text-gray-400 italic bg-gray-50 p-2.5 rounded-xl border border-gray-100 w-max">
            <div className="flex space-x-1">
              <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-bounce" />
              <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]" />
              <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]" />
            </div>
            <span>AI is analyzing candidates...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput onSend={sendMessage} disabled={isSending || isLoadingHistory} />
    </div>
  );
};

export default ChatWindow;
