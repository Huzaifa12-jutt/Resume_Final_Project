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
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
          isUser ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 border border-gray-200'
        }`}
      >
        {isUser ? <FiUser className="h-4 w-4" /> : <FiCpu className="h-4 w-4 text-indigo-600" />}
      </div>

      <div className={`max-w-[85%] sm:max-w-[75%] space-y-1`}>
        <div
          className={`rounded-2xl p-4 text-sm leading-relaxed ${
            isUser
              ? 'bg-indigo-600 text-white rounded-tr-none'
              : 'bg-gray-50 text-gray-800 border border-gray-100 rounded-tl-none shadow-xs'
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div
              className="prose prose-sm max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-li:my-0.5 text-gray-800"
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
