import React from 'react';
import type { Product, View, User } from '../types';
import ProductCard from '../components/ProductCard';
import Button from '../components/ui/Button';
import { Card } from '../components/ui/Card';

interface SavedItemsPageProps {
  products: Product[];
  savedItems: Set<string>;
  onProductSelect: (product: Product) => void;
  onToggleSave: (productId: string) => void;
  onNavigate: (view: View) => void;
  currentUser: User | null;
  onReportProduct: (product: Product) => void;
}

const SavedItemsPage: React.FC<SavedItemsPageProps> = ({ products, savedItems, onProductSelect, onToggleSave, onNavigate, currentUser, onReportProduct }) => {
  const savedProducts = products.filter(product => savedItems.has(product.id));

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-text-main dark:text-secondary mb-8">Mes Favoris ({savedProducts.length})</h1>
      
      {savedProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {savedProducts.map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onClick={() => onProductSelect(product)}
              isSaved={true}
              onToggleSave={onToggleSave}
              currentUser={currentUser}
              onReport={onReportProduct}
            />
          ))}
        </div>
      ) : (
        <Card className="text-center py-20 px-6">
            <i className="fa-regular fa-heart text-6xl text-gray-300 dark:text-gray-600 mb-4"></i>
            <h2 className="text-2xl font-bold text-text-main dark:text-secondary">Votre liste de favoris est vide</h2>
            <p className="text-text-light dark:text-gray-400 mt-2 mb-6 max-w-md mx-auto">
                Cliquez sur le cœur sur les articles que vous aimez pour les retrouver facilement ici.
            </p>
            <Button onClick={() => onNavigate({ name: 'home' })} className="h-11 px-6">
                Découvrir des articles
            </Button>
        </Card>
      )}
    </div>
  );
};

export default SavedItemsPage;