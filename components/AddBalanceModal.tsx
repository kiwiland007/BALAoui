import React, { useState } from 'react';
import Button from './ui/Button';

interface AddBalanceModalProps {
  onClose: () => void;
  onAddBalance: (amount: number) => void;
}

const presetAmounts = [50, 100, 200, 500];

const AddBalanceModal: React.FC<AddBalanceModalProps> = ({ onClose, onAddBalance }) => {
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAddBalance = () => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      alert("Veuillez entrer un montant valide.");
      return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      onAddBalance(numericAmount);
      setIsProcessing(false);
    }, 1500);
  };
  
  const handleAmountSelect = (presetAmount: number) => {
    setAmount(presetAmount.toString());
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
            <i className="fa-solid fa-wallet text-primary"></i>
            <span>Recharger votre solde</span>
          </h2>
          <button onClick={onClose} className="text-text-light dark:text-gray-400 hover:text-text-main dark:hover:text-secondary text-2xl">&times;</button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-text-main dark:text-secondary mb-2">Montant (MAD)</label>
            <div className="relative">
                <input
                    type="number"
                    id="amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-4 pr-16 py-2 bg-inherit border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    placeholder="ex: 100"
                />
                <span className="absolute inset-y-0 right-4 flex items-center text-text-light dark:text-gray-400">MAD</span>
            </div>
             <div className="mt-3 flex flex-wrap gap-2">
                {presetAmounts.map(pa => (
                  <button
                    key={pa}
                    onClick={() => handleAmountSelect(pa)}
                    className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
                      amount === pa.toString()
                        ? 'bg-primary text-white border-primary'
                        : 'bg-transparent border-gray-300 dark:border-gray-600 hover:border-primary hover:text-primary dark:hover:text-primary'
                    }`}
                  >
                    {pa} MAD
                  </button>
                ))}
              </div>
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
             <h4 className="font-bold text-text-main dark:text-secondary mb-3">Informations de paiement</h4>
             <div className="space-y-3">
                <input type="text" placeholder="Numéro de carte" className="w-full p-2 bg-inherit border border-gray-300 dark:border-gray-600 rounded-lg" />
                <div className="flex space-x-3">
                   <input type="text" placeholder="MM/AA" className="w-1/2 p-2 bg-inherit border border-gray-300 dark:border-gray-600 rounded-lg" />
                   <input type="text" placeholder="CVC" className="w-1/2 p-2 bg-inherit border border-gray-300 dark:border-gray-600 rounded-lg" />
                </div>
             </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 rounded-b-lg">
          <button
            onClick={handleAddBalance}
            disabled={!amount || isProcessing}
            className="w-full text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed bg-gradient-to-r from-primary to-accent hover:from-primary-dark hover:to-accent-dark flex items-center justify-center"
          >
            {isProcessing ? 'Traitement...' : `Ajouter ${amount || '0'} MAD`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddBalanceModal;