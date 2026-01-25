import React from 'react';

interface ImageZoomModalProps {
  imageUrl: string;
  onClose: () => void;
}

const ImageZoomModal: React.FC<ImageZoomModalProps> = ({ imageUrl, onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 p-4 font-sans animate-fade-in-fast" 
      onClick={onClose}
    >
      <div 
        className="relative max-w-4xl max-h-[90vh]" 
        onClick={(e) => e.stopPropagation()}
      >
        <img 
          src={imageUrl} 
          alt="Zoomed product view" 
          className="w-full h-full object-contain rounded-lg"
        />
        <button 
          onClick={onClose} 
          className="absolute -top-4 -right-4 bg-white dark:bg-gray-800 text-text-main dark:text-secondary rounded-full h-10 w-10 flex items-center justify-center text-2xl shadow-lg hover:scale-110 transition-transform"
          aria-label="Close zoomed image"
        >
          &times;
        </button>
      </div>
    </div>
  );
};

export default ImageZoomModal;
