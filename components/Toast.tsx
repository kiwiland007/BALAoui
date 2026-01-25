import React from 'react';

interface ToastProps {
  message: string;
  icon: string;
}

const Toast: React.FC<ToastProps> = ({ message, icon }) => {
  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-gray-800 dark:bg-secondary text-white dark:text-gray-900 px-6 py-3 rounded-full shadow-lg flex items-center space-x-3 z-50 animate-slide-up animate-fade-out">
      <i className={`${icon} text-lg`}></i>
      <span className="font-semibold text-sm">{message}</span>
    </div>
  );
};

export default Toast;
