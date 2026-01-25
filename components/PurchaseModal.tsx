import React from 'react';
import type { Product } from '../types';
import Button from './ui/Button';

interface PurchaseModalProps {
  product: Product;
  onClose: () => void;
  onConfirm: () => void;
}

const PurchaseModal: React.FC<PurchaseModalProps> = ({ product, onClose, onConfirm }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 font-sans" onClick={onClose}>
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md flex flex-col transition-transform duration-300" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-text-main dark:text-secondary flex items-center space-x-2">
            <i className="fa-solid fa-bolt text-primary"></i>
            <span>Confirmer votre achat</span>
          </h2>
          <button onClick={onClose} className="text-text-light dark:text-gray-400 hover:text-text-main dark:hover:text-secondary text-2xl">&times;</button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
            <div className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <img src={product.images[0]} alt={product.title} className="w-20 h-20 object-cover rounded-md" />
                <div>
                    <h3 className="font-semibold text-text-main dark:text-secondary">{product.title}</h3>
                    <p className="text-lg font-bold text-primary dark:text-teal-400">{product.price} MAD</p>
                    <p className="text-sm text-text-light dark:text-gray-400">Vendu par {product.seller.name}</p>
                </div>
            </div>

            <div className="text-sm text-text-light dark:text-gray-400 bg-gray-100 dark:bg-gray-900/50 p-3 rounded-lg">
                <p className="font-semibold text-text-main dark:text-secondary mb-1">Prochaines étapes :</p>
                <ul className="list-disc list-inside space-y-1">
                    <li>Le vendeur sera notifié de votre intérêt.</li>
                    <li>Utilisez la messagerie pour arranger le paiement et la livraison.</li>
                    <li>Nous recommandons le paiement à la livraison pour votre sécurité.</li>
                </ul>
            </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 rounded-b-lg flex justify-end space-x-3">
          <Button variant="ghost" onClick={onClose} className="h-11 px-6">Annuler</Button>
          <Button onClick={onConfirm} className="h-11 px-6">
            Confirmer l'achat
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PurchaseModal;