
import React, { useState, useEffect, useRef } from 'react';
import type { User, Conversation, View } from '../types';
import ChatList from '../components/ChatList';
import ChatMessage from '../components/ChatMessage';
import { Card } from '../components/ui/Card';
import Button from '../components/ui/Button';

interface ChatPageProps {
  currentUser: User;
  conversations: Conversation[];
  onNavigate: (view: View) => void;
  onSendMessage: (conversationId: string, text: string) => void;
  initialConversationId?: string;
  isConversationsLoading: boolean;
}

const ChatPage: React.FC<ChatPageProps> = ({ currentUser, conversations, onNavigate, onSendMessage, initialConversationId, isConversationsLoading }) => {
  const [activeConversationId, setActiveConversationId] = useState<string | null>(initialConversationId || null);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialConversationId) {
      setActiveConversationId(initialConversationId);
    } else if (conversations.length > 0 && !activeConversationId) {
      setActiveConversationId(conversations[0].id);
    }
  }, [initialConversationId, conversations, activeConversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversationId, conversations]);

  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const otherParticipant = activeConversation?.participants.find(p => p.id !== currentUser.id);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && activeConversationId) {
      onSendMessage(activeConversationId, newMessage);
      setNewMessage('');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-text-main dark:text-secondary mb-6">Messagerie</h1>
      <Card className="h-[75vh] flex overflow-hidden">
        <div className="w-full md:w-1/3 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          <ChatList
            conversations={conversations}
            currentUser={currentUser}
            activeConversationId={activeConversationId}
            onConversationSelect={setActiveConversationId}
            isLoading={isConversationsLoading}
          />
        </div>
        <div className="hidden md:w-2/3 md:flex flex-col">
          {activeConversation && otherParticipant ? (
            <>
              {/* Chat Header */}
              <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img src={otherParticipant.avatarUrl} alt={otherParticipant.name} className="w-10 h-10 rounded-full" />
                  <div>
                    <p className="font-semibold text-text-main dark:text-secondary">{otherParticipant.name}</p>
                    <p className="text-sm text-text-light dark:text-gray-400 cursor-pointer hover:underline" onClick={() => onNavigate({ name: 'productDetail', product: activeConversation.product })}>
                      {activeConversation.product.title}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" onClick={() => onNavigate({ name: 'profile', user: otherParticipant })}>
                    Voir le profil
                </Button>
              </div>

              {/* Chat Body */}
              <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-800/50 space-y-4">
                {activeConversation.messages.map(message => (
                  <ChatMessage key={message.id} message={message} isOwnMessage={message.senderId === currentUser.id} />
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-3 bg-gray-100 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
                  <input
                    type="text"
                    placeholder="Écrivez un message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 p-2 border dark:border-gray-600 rounded-full bg-white dark:bg-gray-700 dark:text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <Button type="submit" className="rounded-full w-10 h-10 flex-shrink-0">
                    <i className="fa-solid fa-paper-plane"></i>
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-gray-50 dark:bg-gray-800/50">
                <i className="fa-regular fa-comments text-6xl text-gray-300 dark:text-gray-600 mb-4"></i>
                <h2 className="text-xl font-semibold text-text-main dark:text-secondary">Sélectionnez une conversation</h2>
                <p className="text-text-light dark:text-gray-400 mt-1">Vos messages avec les autres utilisateurs apparaîtront ici.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ChatPage;
