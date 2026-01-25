import React, { useState } from 'react';
import type { Product, User } from '../types';
import type { AppSettings } from '../App';

interface BoostModalProps {
  product: Product;
  onClose: () => void;
  onConfirmBoost: (productId: string, option: 'bump' | 'feature', paymentMethod: 'card' | 'balance') => void;
  settings: AppSettings;
  currentUser: User;
}

const BoostModal: React.FC<BoostModalProps> = ({ product, onClose, onConfirmBoost, settings, currentUser }) => {
  const [selectedOption, setSelectedOption] = useState<'bump' | 'feature' | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'card' | 'balance' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const cost = selectedOption === 'bump' ? settings.bumpPrice : settings.featurePrice;
  const hasSufficientBalance = currentUser.balance >= cost;

  const handlePayment = () => {
    if (!selectedOption || !selectedPaymentMethod) {
      return;
    }
    setIsProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
        onConfirmBoost(product.id, selectedOption, selectedPaymentMethod);
        setIsProcessing(false);
    }, 1500);
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
            <i className="fa-solid fa-rocket text-primary"></i>
            <span>Promouvoir votre article</span>
          </h2>
          <button onClick={onClose} className="text-text-light dark:text-gray-400 hover:text-text-main dark:hover:text-secondary text-2xl">&times;</button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
            <div className="flex items-center space-x-4">
                <img src={product.images[0]} alt={product.title} className="w-16 h-16 object-cover rounded-md" />
                <div>
                    <h3 className="font-semibold text-text-main dark:text-secondary">{product.title}</h3>
                    <p className="text-sm text-text-light dark:text-gray-400">{product.price} MAD</p>
                </div>
            </div>

            <div className="space-y-4">
                {/* Bump Option */}
                <div 
                    onClick={() => setSelectedOption('bump')}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-300 ${selectedOption === 'bump' ? 'border-primary bg-primary/10 dark:bg-primary/20 ring-2 ring-primary' : 'border-gray-200 dark:border-gray-600 hover:border-primary/50'}`}
                >
                    <div className="flex justify-between items-center">
                        <h4 className="font-bold text-text-main dark:text-secondary">Remonter en tête de liste</h4>
                        <p className="font-bold text-primary">{settings.bumpPrice} MAD</p>
                    </div>
                    <p className="text-sm text-text-light dark:text-gray-400 mt-1">Votre article apparaîtra en haut des résultats comme s'il venait d'être publié.</p>
                </div>

                {/* Feature Option */}
                <div 
                    onClick={() => setSelectedOption('feature')}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-300 ${selectedOption === 'feature' ? 'border-primary bg-primary/10 dark:bg-primary/20 ring-2 ring-primary' : 'border-gray-200 dark:border-gray-600 hover:border-primary/50'}`}
                >
                    <div className="flex justify-between items-center">
                         <h4 className="font-bold text-text-main dark:text-secondary">Mettre à la une (7 jours)</h4>
                        <p className="font-bold text-primary">{settings.featurePrice} MAD</p>
                    </div>
                    <p className="text-sm text-text-light dark:text-gray-400 mt-1">Votre article sera visible sur la page d'accueil et en haut des recherches pour une visibilité maximale.</p>
                </div>
            </div>

            {selectedOption && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h4 className="font-bold text-text-main dark:text-secondary mb-3">Choisir un moyen de paiement</h4>
                    <div className="space-y-3">
                         <div 
                            onClick={() => setSelectedPaymentMethod('card')}
                            className={`flex items-center space-x-4 p-3 border-2 rounded-lg cursor-pointer ${selectedPaymentMethod === 'card' ? 'border-primary bg-primary/10 dark:bg-primary/20' : 'border-gray-200 dark:border-gray-600'}`}
                         >
                            <i className="fa-solid fa-credit-card text-xl text-primary"></i>
                            <div>
                                <p className="font-semibold text-text-main dark:text-secondary">Carte Bancaire</p>
                                <p className="text-xs text-text-light dark:text-gray-400">Visa, Mastercard, CMI</p>
                            </div>
                         </div>
                         <div
                            onClick={() => { if(hasSufficientBalance) setSelectedPaymentMethod('balance') }}
                            className={`flex items-center space-x-4 p-3 border-2 rounded-lg transition-colors ${selectedPaymentMethod === 'balance' ? 'border-primary bg-primary/10 dark:bg-primary/20' : 'border-gray-200 dark:border-gray-600'} ${hasSufficientBalance ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
                         >
                             <i className="fa-solid fa-wallet text-xl text-primary"></i>
                            <div>
                                <p className="font-semibold text-text-main dark:text-secondary">Solde BALAoui</p>
                                <p className={`text-xs ${hasSufficientBalance ? 'text-text-light dark:text-gray-400' : 'text-red-500'}`}>
                                    Solde disponible : {currentUser.balance.toFixed(2)} MAD
                                </p>
                            </div>
                         </div>
                    </div>
                </div>
            )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 rounded-b-lg">
          <button 
            onClick={handlePayment}
            disabled={!selectedOption || !selectedPaymentMethod || isProcessing}
            className="w-full text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none bg-gradient-to-r from-primary to-accent hover:from-primary-dark hover:to-accent-dark transform hover:scale-105 flex items-center justify-center"
          >
            {isProcessing ? (
                <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Traitement...</span>
                </>
            ) : (
                <span>Payer et continuer</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BoostModal;