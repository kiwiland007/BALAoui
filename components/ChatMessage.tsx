
import React from 'react';
import type { Message } from '../types';

interface ChatMessageProps {
  message: Message;
  isOwnMessage: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isOwnMessage }) => {
  const alignment = isOwnMessage ? 'justify-end' : 'justify-start';
  const bubbleClasses = isOwnMessage
    ? 'bg-primary text-white'
    : 'bg-white dark:bg-gray-700 text-text-main dark:text-secondary shadow-sm';
  
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  return (
    <div className={`flex ${alignment}`}>
      <div className={`p-3 rounded-lg max-w-sm ${bubbleClasses}`}>
        <p className="text-sm">{message.text}</p>
        <p className={`text-xs text-right mt-1 ${isOwnMessage ? 'text-teal-100/70' : 'text-gray-400'}`}>
            {formatTime(message.timestamp)}
        </p>
      </div>
    </div>
  );
};

export default ChatMessage;
