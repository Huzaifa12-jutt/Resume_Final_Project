import React from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { FiUser, FiCpu } from 'react-icons/fi';

const ChatBubble = ({ message }) => {
  const isUser = message.sender === 'user' || message.role === 'user';

  const formatTime = (ts) => {
    if (!ts) return '';
    try {
      return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  const getParsedMarkdown = (content) => {
    try {
      const rawHtml = marked.parse(content || '');
      return { __html: DOMPurify.sanitize(rawHtml) };
    } catch (e) {
      return { __html: content };
    }
  };

  return (
    <div className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold shadow-md ${
          isUser 
            ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white' 
            : 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white'
        }`}
      >
        {isUser ? <FiUser className="h-4 w-4" /> : <FiCpu className="h-4 w-4" />}
      </div>

      <div className={`max-w-[85%] sm:max-w-[75%] space-y-1`}>
        <div
          className={`rounded-2xl p-4 text-sm leading-relaxed shadow-sm ${
            isUser
              ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-tr-none'
              : 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800 border border-gray-200 rounded-tl-none'
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap font-medium">{message.content}</p>
          ) : (
            <div
              className="prose prose-sm max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-li:my-0.5 prose-strong:text-indigo-600 prose-a:text-indigo-500 prose-headings:text-gray-900 prose-ul:text-gray-700 prose-li:text-gray-600"
              dangerouslySetInnerHTML={getParsedMarkdown(message.content)}
            />
          )}
        </div>

        {message.timestamp && (
          <p className={`text-[10px] text-gray-400 px-1 ${isUser ? 'text-right' : 'text-left'}`}>
            {formatTime(message.timestamp)}
          </p>
        )}
      </div>
    </div>
  );
};

export default ChatBubble;
