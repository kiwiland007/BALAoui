import React, { useMemo } from 'react';
import type { Product, View, User } from '../types';
import ProductCard from '../components/ProductCard';
import { Card } from '../components/ui/Card';
import { categoryGroups } from '../constants';

interface SearchResultsPageProps {
  query: string;
  allProducts: Product[];
  onProductSelect: (product: Product) => void;
  savedItems: Set<string>;
  onToggleSave: (productId: string) => void;
  currentUser: User | null;
  onReportProduct: (product: Product) => void;
}

const SearchResultsPage: React.FC<SearchResultsPageProps> = ({ query, allProducts, onProductSelect, savedItems, onToggleSave, currentUser, onReportProduct }) => {
  
  const searchResults = useMemo(() => {
    if (!query) return [];
    const lowerCaseQuery = query.toLowerCase();

    const mainCategoryQueryKey = Object.keys(categoryGroups).find(
        key => key.toLowerCase() === lowerCaseQuery
    ) as keyof typeof categoryGroups | undefined;

    if (mainCategoryQueryKey) {
        const subCategories = categoryGroups[mainCategoryQueryKey];
        return allProducts.filter(p => subCategories.includes(p.category));
    }

    return allProducts.filter(p => 
        p.title.toLowerCase().includes(lowerCaseQuery) ||
        p.description.toLowerCase().includes(lowerCaseQuery) ||
        p.category.toLowerCase().includes(lowerCaseQuery) ||
        p.seller.name.toLowerCase().includes(lowerCaseQuery) ||
        p.city.toLowerCase().includes(lowerCaseQuery)
    );
  }, [query, allProducts]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-text-main dark:text-secondary mb-2">
        Résultats pour "{query}"
      </h1>
      <p className="text-text-light dark:text-gray-400 mb-8">{searchResults.length} article{searchResults.length > 1 ? 's' : ''} trouvé{searchResults.length > 1 ? 's' : ''}</p>
      
      {searchResults.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {searchResults.map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onClick={() => onProductSelect(product)}
              isSaved={savedItems.has(product.id)}
              onToggleSave={onToggleSave}
              currentUser={currentUser}
              onReport={onReportProduct}
            />
          ))}
        </div>
      ) : (
        <Card className="text-center py-20 px-6">
            <i className="fa-solid fa-magnifying-glass-minus text-6xl text-gray-300 dark:text-gray-600 mb-4"></i>
            <h2 className="text-2xl font-bold text-text-main dark:text-secondary">Aucun résultat</h2>
            <p className="text-text-light dark:text-gray-400 mt-2 mb-6 max-w-md mx-auto">
                Nous n'avons trouvé aucun article correspondant à votre recherche. Essayez avec d'autres mots-clés.
            </p>
        </Card>
      )}
    </div>
  );
};

export default SearchResultsPage;