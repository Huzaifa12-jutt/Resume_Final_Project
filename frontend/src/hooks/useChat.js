import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { chatService } from '../services/chatService';

export const useChat = (jobId) => {
  const [messages, setMessages] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const fetchHistory = useCallback(async () => {
    if (!jobId) return;
    setIsLoadingHistory(true);
    try {
      const data = await chatService.getChatHistory(jobId);
      const historyList = Array.isArray(data) ? data : data.messages || data.history || [];
      setMessages(historyList);
    } catch (error) {
      console.error('Failed to load chat history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [jobId]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const sendMessage = async (text) => {
    if (!text.trim() || isSending) return;

    const userMessage = {
      id: Date.now().toString(),
      sender: 'user',
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsSending(true);

    try {
      const response = await chatService.sendMessage(jobId, text);
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        role: 'assistant',
        content: response.response || response.reply || response.message || 'No reply received',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to send message to AI');
    } finally {
      setIsSending(false);
    }
  };

  return {
    messages,
    isLoadingHistory,
    isSending,
    sendMessage,
    fetchHistory,
  };
};

export default useChat;
