
import React, { useState } from 'react';
import type { Product } from '../types';
import Button from './ui/Button';

interface ShareModalProps {
  product: Product;
  onClose: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ product, onClose }) => {
  const [copyButtonText, setCopyButtonText] = useState('Copier');
  // In a real app with routing, this URL would be dynamic.
  const productUrl = `https://balaoui.ma/product/${product.id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(productUrl).then(() => {
      setCopyButtonText('Copié !');
      setTimeout(() => setCopyButtonText('Copier'), 2000);
    });
  };
  
  const shareText = `Découvrez cet article sur BALAoui: ${product.title}`;

  const socialLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(productUrl)}&text=${encodeURIComponent(shareText)}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + productUrl)}`,
    email: `mailto:?subject=${encodeURIComponent(product.title)}&body=${encodeURIComponent(shareText + '\n\n' + productUrl)}`,
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 font-sans" onClick={onClose}>
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md flex flex-col transition-transform duration-300" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-text-main dark:text-secondary flex items-center space-x-2">
            <i className="fa-solid fa-share-nodes text-primary"></i>
            <span>Partager cet article</span>
          </h2>
          <button onClick={onClose} className="text-text-light dark:text-gray-400 hover:text-text-main dark:hover:text-secondary text-2xl">&times;</button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="flex items-center space-x-4">
            <img src={product.images[0]} alt={product.title} className="w-16 h-16 object-cover rounded-md" />
            <div>
              <h3 className="font-semibold text-text-main dark:text-secondary">{product.title}</h3>
              <p className="text-sm text-text-light dark:text-gray-400">{product.price} MAD</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <input 
                type="text" 
                readOnly 
                value={productUrl} 
                className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm" 
            />
            <Button variant="outline" onClick={handleCopy} className="h-10 px-4">{copyButtonText}</Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
            <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                <i className="fa-brands fa-facebook-f text-2xl text-[#1877F2]"></i>
            </a>
             <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                <i className="fa-brands fa-twitter text-2xl text-[#1DA1F2]"></i>
            </a>
             <a href={socialLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                <i className="fa-brands fa-whatsapp text-2xl text-[#25D366]"></i>
            </a>
             <a href={socialLinks.email} target="_blank" rel="noopener noreferrer" className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                <i className="fa-solid fa-envelope text-2xl text-text-light dark:text-gray-400"></i>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
