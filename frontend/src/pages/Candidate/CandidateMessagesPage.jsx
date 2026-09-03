import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import RoleShell from '../../components/layout/RoleShell';
import ConversationList from '../../components/messaging/ConversationList';
import ChatWindow from '../../components/messaging/ChatWindow';
import { messagingService } from '../../services/messagingService';
import useAuth from '../../hooks/useAuth';
import useDocumentTitle from '../../hooks/useDocumentTitle';

export default function CandidateMessagesPage() {
  useDocumentTitle('Messages — TEEROP');
  const { user } = useAuth();
  const { conversationId } = useParams();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadConversations = useCallback(async () => {
    try {
      const data = await messagingService.listConversations();
      setConversations(data || []);
      return data || [];
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setConversations([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConversations().then((data) => {
      // If no conversation selected in URL and there are conversations, select the first on desktop
      if (!conversationId && data.length > 0 && window.innerWidth >= 768) {
        navigate(`/candidate/messages/${data[0].id}`, { replace: true });
      }
    });
  }, [conversationId, loadConversations, navigate]);

  const selectedConversation = conversations.find((c) => c.id === conversationId) || null;

  const handleSelectConversation = (conv) => {
    // Clear unread count locally for responsive UX
    setConversations((prev) =>
      prev.map((item) => (item.id === conv.id ? { ...item, unread_count: 0 } : item))
    );
    navigate(`/candidate/messages/${conv.id}`);
  };

  const handleBackToList = () => {
    navigate('/candidate/messages');
  };

  const handleMessageSent = (convId, messageText) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === convId
          ? {
              ...c,
              last_message: messageText,
              last_message_at: new Date().toISOString(),
            }
          : c
      )
    );
  };

  return (
    <RoleShell
      title="Messages"
      subtitle="Direct communication with recruiters & hiring teams."
      role="candidate"
    >
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden h-[720px] flex flex-col md:flex-row">
        {/* Left: Conversation List */}
        <div
          className={`w-full md:w-80 lg:w-96 shrink-0 h-full ${
            conversationId ? 'hidden md:block' : 'block'
          }`}
        >
          <ConversationList
            conversations={conversations}
            selectedId={conversationId}
            onSelect={handleSelectConversation}
            isRecruiter={false}
            loading={loading}
          />
        </div>

        {/* Right: Chat Window */}
        <div
          className={`flex-1 h-full min-w-0 ${
            !conversationId ? 'hidden md:block' : 'block'
          }`}
        >
          <ChatWindow
            conversation={selectedConversation}
            currentUser={user}
            isRecruiter={false}
            onBack={handleBackToList}
            onMessageSent={handleMessageSent}
          />
        </div>
      </div>
    </RoleShell>
  );
}
