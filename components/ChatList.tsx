
import React from 'react';
import type { User, Conversation } from '../types';

interface ChatListProps {
  conversations: Conversation[];
  currentUser: User;
  activeConversationId: string | null;
  onConversationSelect: (id: string) => void;
  isLoading: boolean;
}

const ChatList: React.FC<ChatListProps> = ({ conversations, currentUser, activeConversationId, onConversationSelect, isLoading }) => {
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = (now.getTime() - date.getTime()) / 1000;
    const diffInMinutes = diffInSeconds / 60;
    const diffInHours = diffInMinutes / 60;
    const diffInDays = diffInHours / 24;

    if (diffInMinutes < 1) return `à l'instant`;
    if (diffInMinutes < 60) return `${Math.round(diffInMinutes)} min`;
    if (diffInHours < 24) return `${Math.round(diffInHours)} h`;
    if (diffInDays < 7) return `${Math.round(diffInDays)} j`;
    return date.toLocaleDateString('fr-FR');
  };

  if (isLoading) {
    return (
        <div className="p-4 space-y-3 animate-pulse">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-700"></div>
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                </div>
            ))}
        </div>
    );
  }
  
  if (conversations.length === 0) {
    return (
        <div className="p-4 text-center text-sm text-text-light dark:text-gray-400">
            <i className="fa-regular fa-folder-open text-3xl mb-2"></i>
            <p>Aucune conversation pour le moment.</p>
        </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {conversations.map(conv => {
        const otherParticipant = conv.participants.find(p => p.id !== currentUser.id);
        if (!otherParticipant) return null;
        const lastMessage = conv.messages[conv.messages.length - 1];
        const isActive = conv.id === activeConversationId;

        return (
          <div
            key={conv.id}
            onClick={() => onConversationSelect(conv.id)}
            className={`p-3 flex items-center space-x-3 cursor-pointer border-b border-gray-200 dark:border-gray-700 transition-colors ${
              isActive ? 'bg-primary/10 dark:bg-primary/20' : 'hover:bg-gray-100 dark:hover:bg-gray-700/50'
            }`}
          >
            <img src={otherParticipant.avatarUrl} alt={otherParticipant.name} className="w-12 h-12 rounded-full" />
            <div className="flex-1 overflow-hidden">
              <div className="flex justify-between items-center">
                <p className="font-semibold text-text-main dark:text-secondary truncate">{otherParticipant.name}</p>
                <p className="text-xs text-text-light dark:text-gray-400 flex-shrink-0">{formatTimestamp(conv.lastMessageTimestamp)}</p>
              </div>
              <p className="text-sm text-text-light dark:text-gray-400 truncate">
                {lastMessage ? `${lastMessage.senderId === currentUser.id ? 'Vous: ' : ''}${lastMessage.text}` : `À propos de: ${conv.product.title}`}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ChatList;
