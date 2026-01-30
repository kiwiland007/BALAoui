
import React, { useState, useMemo } from 'react';
// FIX: Import User type to be used in component props.
import type { Product, User } from '../types';
import type { AppSettings } from '../App';
import Button from './ui/Button';

interface CheckoutModalProps {
  product: Product;
  appSettings: AppSettings;
  onClose: () => void;
  onConfirmPurchase: (product: Product, buyerProtectionFee: number, shippingFee: number, totalAmount: number) => void;
  // FIX: Add currentUser to props to access user's name.
  currentUser: User | null;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ product, appSettings, onClose, onConfirmPurchase, currentUser }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const buyerProtectionFee = useMemo(() => {
    return (product.price * (appSettings.buyerProtectionFeePercent / 100)) + appSettings.buyerProtectionFeeFixed;
  }, [product.price, appSettings]);

  const shippingFee = appSettings.shippingFee;
  const totalAmount = product.price + buyerProtectionFee + shippingFee;

  const handlePayment = () => {
    setIsProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
        onConfirmPurchase(product, buyerProtectionFee, shippingFee, totalAmount);
        setIsProcessing(false);
    }, 1500);
  };

  const inputClasses = "w-full px-3 py-2 bg-inherit border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 font-sans" onClick={onClose}>
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg flex flex-col transition-transform duration-300" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-text-main dark:text-secondary flex items-center space-x-2">
            <i className="fa-solid fa-shield-halved text-primary"></i>
            <span>Paiement Sécurisé</span>
          </h2>
          <button onClick={onClose} className="text-text-light dark:text-gray-400 hover:text-text-main dark:hover:text-secondary text-2xl">&times;</button>
        </div>

        {/* Body */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left side: Order summary */}
            <div className="space-y-4">
                <h3 className="font-bold text-text-main dark:text-secondary">Récapitulatif de la commande</h3>
                <div className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <img src={product.images[0]} alt={product.title} className="w-16 h-16 object-cover rounded-md" />
                    <div>
                        <h3 className="font-semibold text-text-main dark:text-secondary">{product.title}</h3>
                        <p className="text-sm text-text-light dark:text-gray-400">Vendu par {product.seller.name}</p>
                    </div>
                </div>
                <div className="space-y-2 text-sm border-t dark:border-gray-700 pt-4">
                    <div className="flex justify-between">
                        <span className="text-text-light dark:text-gray-400">Prix de l'article</span>
                        <span className="font-medium text-text-main dark:text-secondary">{product.price.toFixed(2)} MAD</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-text-light dark:text-gray-400">Protection acheteurs</span>
                        <span className="font-medium text-text-main dark:text-secondary">{buyerProtectionFee.toFixed(2)} MAD</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-text-light dark:text-gray-400">Frais de port</span>
                        <span className="font-medium text-text-main dark:text-secondary">{shippingFee.toFixed(2)} MAD</span>
                    </div>
                </div>
                <div className="flex justify-between font-bold text-lg border-t dark:border-gray-700 pt-3">
                    <span className="text-text-main dark:text-secondary">Total</span>
                    <span className="text-primary">{totalAmount.toFixed(2)} MAD</span>
                </div>
            </div>
            
            {/* Right side: Payment form */}
            <div className="space-y-4">
                 <h3 className="font-bold text-text-main dark:text-secondary">Informations de paiement</h3>
                 <div className="space-y-3">
                    <input type="text" placeholder="Numéro de carte" className={inputClasses} defaultValue="4916 1234 5678 9101" />
                    <input type="text" placeholder="Nom sur la carte" className={inputClasses} defaultValue={currentUser?.name || ""} />
                    <div className="flex space-x-3">
                       <input type="text" placeholder="MM/AA" className={inputClasses} defaultValue="12/26" />
                       <input type="text" placeholder="CVC" className={inputClasses} defaultValue="123" />
                    </div>
                 </div>
                 <div className="text-xs text-text-light dark:text-gray-400 flex items-start space-x-2">
                    <i className="fa-solid fa-lock mt-0.5"></i>
                    <span>Vos informations de paiement sont sécurisées et cryptées.</span>
                 </div>
            </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 rounded-b-lg">
          <Button
            onClick={handlePayment}
            disabled={isProcessing}
            className="w-full text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Paiement en cours...' : `Payer ${totalAmount.toFixed(2)} MAD`}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;