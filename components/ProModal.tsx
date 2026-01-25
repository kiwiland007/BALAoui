import React, { useState } from 'react';
import type { User } from '../types';
import type { AppSettings } from '../App';
import Button from './ui/Button';

interface ProModalProps {
  onClose: () => void;
  onSubscribe: () => void;
  settings: AppSettings;
  currentUser: User;
}

const ProModal: React.FC<ProModalProps> = ({ onClose, onSubscribe, settings, currentUser }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const cost = settings.proSubscriptionPrice;
  const hasSufficientBalance = currentUser.balance >= cost;

  const handleSubscribe = () => {
    setIsProcessing(true);
    setTimeout(() => {
      onSubscribe();
      setIsProcessing(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 font-sans" onClick={onClose}>
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg flex flex-col transition-transform duration-300" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-text-main dark:text-secondary flex items-center space-x-2">
            <i className="fa-solid fa-crown text-accent"></i>
            <span>Devenez Vendeur Pro</span>
          </h2>
          <button onClick={onClose} className="text-text-light dark:text-gray-400 hover:text-text-main dark:hover:text-secondary text-2xl">&times;</button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <p className="text-center text-text-light dark:text-gray-400">Passez au niveau supérieur et vendez plus efficacement avec nos avantages exclusifs.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                <i className="fa-solid fa-shield-halved text-2xl text-primary mb-2"></i>
                <h4 className="font-bold text-text-main dark:text-secondary">Badge Pro</h4>
                <p className="text-xs text-text-light dark:text-gray-400">Inspirez confiance aux acheteurs.</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                <i className="fa-solid fa-percent text-2xl text-primary mb-2"></i>
                <h4 className="font-bold text-text-main dark:text-secondary">Commission Réduite</h4>
                <p className="text-xs text-text-light dark:text-gray-400">Seulement {settings.proCommission}% par vente.</p>
            </div>
             <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                <i className="fa-solid fa-gift text-2xl text-primary mb-2"></i>
                <h4 className="font-bold text-text-main dark:text-secondary">5 Bumps Gratuits</h4>
                <p className="text-xs text-text-light dark:text-gray-400">Chaque mois pour vos articles.</p>
            </div>
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 text-center">
             <p className="text-text-light dark:text-gray-400">Prix de l'abonnement</p>
             <p className="text-3xl font-bold text-primary">{cost} MAD / mois</p>
             <p className={`text-sm mt-2 ${hasSufficientBalance ? 'text-green-600' : 'text-red-500'}`}>
                Votre solde actuel: {currentUser.balance.toFixed(2)} MAD
             </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 rounded-b-lg">
          <Button
            onClick={handleSubscribe}
            disabled={!hasSufficientBalance || isProcessing}
            className="w-full text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Traitement...' : `Payer ${cost} MAD avec mon solde`}
          </Button>
           {!hasSufficientBalance && <p className="text-center text-xs text-red-500 mt-2">Solde insuffisant. Veuillez recharger votre compte.</p>}
        </div>
      </div>
    </div>
  );
};

export default ProModal;