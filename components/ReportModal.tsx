import React, { useState } from 'react';
import type { Product } from '../types';
import Button from './ui/Button';

interface ReportModalProps {
  product: Product | null;
  onClose: () => void;
  onSubmit: (productId: string, reason: string, details: string) => void;
}

const reportReasons = [
    "Article interdit ou contrefaçon",
    "Arnaque ou tentative de fraude",
    "Contenu inapproprié (photos, description)",
    "Spam ou publicité",
    "Autre"
];

const ReportModal: React.FC<ReportModalProps> = ({ product, onClose, onSubmit }) => {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!product) return null;
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) {
        alert("Veuillez sélectionner une raison.");
        return;
    }
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
        onSubmit(product.id, reason, details);
        setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 font-sans" onClick={onClose}>
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg flex flex-col transition-transform duration-300" 
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-bold text-text-main dark:text-secondary flex items-center space-x-2">
              <i className="fa-solid fa-flag text-red-500"></i>
              <span>Signaler l'article</span>
            </h2>
            <button type="button" onClick={onClose} className="text-text-light dark:text-gray-400 hover:text-text-main dark:hover:text-secondary text-2xl">&times;</button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            <p className="text-sm text-text-light dark:text-gray-400">
              Pourquoi signalez-vous l'article "{product.title}" ?
            </p>
            <div className="space-y-2">
              {reportReasons.map((r) => (
                <label key={r} className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 has-[:checked]:bg-teal-50 has-[:checked]:border-primary dark:has-[:checked]:bg-teal-900/30 cursor-pointer">
                  <input 
                    type="radio" 
                    name="reason" 
                    value={r} 
                    checked={reason === r} 
                    onChange={(e) => setReason(e.target.value)}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                  />
                  <span className="text-text-main dark:text-secondary">{r}</span>
                </label>
              ))}
            </div>
             <div>
              <label htmlFor="details" className="block text-sm font-medium text-text-main dark:text-secondary mb-1">Détails (optionnel)</label>
              <textarea 
                id="details" 
                rows={3}
                value={details} 
                onChange={(e) => setDetails(e.target.value)} 
                className="mt-1 block w-full px-3 py-2 bg-inherit border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                placeholder="Fournissez plus d'informations si nécessaire..."
              />
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 rounded-b-lg flex justify-end space-x-3">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting} className="h-10 px-6">Annuler</Button>
            <Button type="submit" disabled={!reason || isSubmitting} className="h-10 px-6">
              {isSubmitting ? 'Envoi...' : 'Envoyer le signalement'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportModal;