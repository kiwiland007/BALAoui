import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import type { Product, View, User } from '../types';
import { ProductCategory, ProductCondition, ProductStatus } from '../types';
import ProductCard from '../components/ProductCard';
import { moroccanCities } from '../constants';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import { Card } from '../components/ui/Card';
import SkeletonCard from '../components/SkeletonCard';

const PAGE_SIZE = 9;

interface Filters {
    category: 'all' | ProductCategory;
    priceRange: [number, number];
    city: 'all' | string;
    conditions: Set<ProductCondition>;
}

const initialFilters: Filters = {
    category: 'all',
    priceRange: [0, 10000],
    city: 'all',
    conditions: new Set(),
};


interface HomePageProps {
  products: Product[];
  onProductSelect: (product: Product) => void;
  onNavigate: (view: View) => void;
  savedItems: Set<string>;
  onToggleSave: (productId: string) => void;
  currentUser: User | null;
  onReportProduct: (product: Product) => void;
  heroImageUrl: string;
  heroSlogan: string;
  heroSubSlogan: string;
}

const categories = [
  { name: "Femmes", icon: 'fa-person-dress' },
  { name: "Hommes", icon: 'fa-shirt' },
  { name: "Enfants", icon: 'fa-child' },
  { name: "Maison", icon: 'fa-couch' },
  { name: "High-Tech", icon: 'fa-mobile-screen-button' },
  { name: "Divertissement", icon: 'fa-gamepad' },
];

const Hero: React.FC<{onNavigate: (view: View) => void; heroImageUrl: string; heroSlogan: string; heroSubSlogan: string;}> = ({onNavigate, heroImageUrl, heroSlogan, heroSubSlogan}) => {
    return (
        <div className="relative rounded-lg shadow-lg overflow-hidden mb-8 h-[450px]">
            <img 
                src={heroImageUrl}
                alt="Vêtements de mode sur un cintre"
                className="absolute inset-0 w-full h-full object-cover"
                aria-hidden="true"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900/60 via-gray-900/40 to-transparent"></div>
            <div className="relative h-full flex flex-col justify-center items-start p-8 md:p-16 text-white">
                <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight stagger-in" style={{ animationDelay: '100ms' }}>
                    {heroSlogan}
                </h1>
                <p className="text-lg text-gray-200 mt-4 max-w-xl stagger-in" style={{ animationDelay: '200ms' }}>
                    {heroSubSlogan}
                </p>
                <div className="mt-8 stagger-in" style={{ animationDelay: '300ms' }}>
                    <Button 
                        onClick={() => onNavigate({name: 'addItem'})}
                        className="text-white font-bold py-3 px-8 rounded-lg bg-gradient-to-r from-primary to-accent hover:from-primary-dark hover:to-accent-dark transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl h-12 animate-pulse-glow"
                    >
                        <i className="fa-solid fa-rocket mr-2"></i>
                        Commencer à vendre
                    </Button>
                </div>
            </div>
        </div>
    );
};

interface CategoryExplorerProps {
    onCategoryClick: (categoryName: string) => void;
}

const CategoryExplorer: React.FC<CategoryExplorerProps> = ({ onCategoryClick }) => (
    <div className="mb-12">
        <h2 className="text-2xl font-bold text-center text-text-main dark:text-secondary mb-6">Explorer par catégorie</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map(category => (
                <Card 
                    key={category.name} 
                    className="p-6 text-center cursor-pointer hover:border-primary dark:hover:border-primary hover:-translate-y-1 transition-all duration-300"
                    onClick={() => onCategoryClick(category.name)}
                >
                    <i className={`fa-solid ${category.icon} text-4xl text-text-light dark:text-gray-400 group-hover:text-primary transition-colors mb-3`}></i>
                    <p className="font-semibold text-text-main dark:text-secondary">{category.name}</p>
                </Card>
            ))}
        </div>
    </div>
);

interface FeaturedItemsProps {
    products: Product[];
    onProductSelect: (product: Product) => void;
    savedItems: Set<string>;
    onToggleSave: (productId: string) => void;
    currentUser: User | null;
    onReportProduct: (product: Product) => void;
}

const FeaturedItems: React.FC<FeaturedItemsProps> = ({ products, onProductSelect, savedItems, onToggleSave, currentUser, onReportProduct }) => {
    if (products.length === 0) return null;
    return (
        <div className="mb-12">
            <h2 className="text-2xl font-bold text-center text-text-main dark:text-secondary mb-6">Articles à la une</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                 {products.map(product => (
                    <ProductCard key={product.id} product={product} onClick={() => onProductSelect(product)} isSaved={savedItems.has(product.id)} onToggleSave={onToggleSave} currentUser={currentUser} onReport={onReportProduct} />
                ))}
            </div>
        </div>
    );
};


const FilterSidebar: React.FC<{ filters: Filters, onFilterChange: (filters: Filters) => void }> = ({ filters, onFilterChange }) => {
    const handleConditionChange = (condition: ProductCondition, checked: boolean) => {
        const newConditions = new Set(filters.conditions);
        if(checked) newConditions.add(condition);
        else newConditions.delete(condition);
        onFilterChange({ ...filters, conditions: newConditions });
    }

    return (
        <Card className="w-full lg:w-72 p-5 h-fit sticky top-24">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-xl text-text-main dark:text-secondary">Filtres</h3>
                <Button variant="ghost" className="text-sm h-auto p-1" onClick={() => onFilterChange(initialFilters)}>Réinitialiser</Button>
            </div>
            <div className="mb-4">
                <label className="font-semibold text-text-main dark:text-secondary block mb-2 text-sm">Catégorie</label>
                <Select value={filters.category} onChange={e => onFilterChange({...filters, category: e.target.value as any})}>
                    <option value="all">Toutes</option>
                    {Object.values(ProductCategory).map(cat => <option key={cat}>{cat}</option>)}
                </Select>
            </div>
            <div className="mb-4">
                <label htmlFor="price" className="font-semibold text-text-main dark:text-secondary block mb-2 text-sm">Prix (jusqu'à {filters.priceRange[1]} MAD)</label>
                <input 
                    type="range" 
                    id="price"
                    min="0"
                    max="10000"
                    step="50"
                    value={filters.priceRange[1]}
                    onChange={e => onFilterChange({...filters, priceRange: [0, parseInt(e.target.value)]})}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary" 
                />
            </div>
            <div className="mb-4">
                <label className="font-semibold text-text-main dark:text-secondary block mb-2 text-sm">Ville</label>
                <Select value={filters.city} onChange={e => onFilterChange({...filters, city: e.target.value})}>
                    <option value="all">Toutes</option>
                    {moroccanCities.map(city => <option key={city}>{city}</option>)}
                </Select>
            </div>
            <div>
                <label className="font-semibold text-text-main dark:text-secondary block mb-2 text-sm">État</label>
                <div className="space-y-2">
                    {Object.values(ProductCondition).map(cond => (
                        <div key={cond} className="flex items-center">
                            <input type="checkbox" id={cond} checked={filters.conditions.has(cond)} onChange={e => handleConditionChange(cond, e.target.checked)} className="h-4 w-4 text-primary bg-inherit border-gray-300 dark:border-gray-600 rounded focus:ring-primary/50" />
                            <label htmlFor={cond} className="ml-3 text-sm text-text-main dark:text-secondary">{cond}</label>
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    );
};

const HomePage: React.FC<HomePageProps> = ({ products, onProductSelect, onNavigate, savedItems, onToggleSave, currentUser, onReportProduct, heroImageUrl, heroSlogan, heroSubSlogan }) => {
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<Filters>(initialFilters);
  
  const approvedProducts = useMemo(() => products.filter(p => p.status === ProductStatus.Approved), [products]);
  const regularProductsSource = useMemo(() => approvedProducts.filter(p => !p.isFeatured), [approvedProducts]);
  const featuredProducts = useMemo(() => approvedProducts.filter(p => p.isFeatured), [approvedProducts]);

  const filteredProducts = useMemo(() => {
    return regularProductsSource.filter(p => {
        if(filters.category !== 'all' && p.category !== filters.category) return false;
        if(p.price > filters.priceRange[1]) return false;
        if(filters.city !== 'all' && p.city !== filters.city) return false;
        if(filters.conditions.size > 0 && !filters.conditions.has(p.condition)) return false;
        return true;
    })
  }, [regularProductsSource, filters]);

  // Effect for handling filter changes and initial load
  useEffect(() => {
    setIsLoading(true);
    // Use a timeout to simulate a network request for filtering
    const timer = setTimeout(() => {
      const firstPage = filteredProducts.slice(0, PAGE_SIZE);
      setDisplayedProducts(firstPage);
      setCurrentPage(1);
      setHasMore(filteredProducts.length > PAGE_SIZE);
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [filteredProducts]);

  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);

    setTimeout(() => {
      const nextPage = currentPage + 1;
      const nextProducts = filteredProducts.slice(
        currentPage * PAGE_SIZE,
        nextPage * PAGE_SIZE
      );
      
      setDisplayedProducts(prev => [...prev, ...nextProducts]);
      setCurrentPage(nextPage);
      setHasMore((nextPage * PAGE_SIZE) < filteredProducts.length);
      setIsLoading(false);
    }, 1000);
  }, [isLoading, hasMore, currentPage, filteredProducts]);

  const observer = useRef<IntersectionObserver | null>(null);
  const observerRef = useCallback(node => {
    if (isLoading) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore();
      }
    });
    
    if (node) observer.current.observe(node);
  }, [isLoading, hasMore, loadMore]);

  const handleCategoryClick = (categoryName: string) => {
    onNavigate({ name: 'search', query: categoryName });
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
        <Hero onNavigate={onNavigate} heroImageUrl={heroImageUrl} heroSlogan={heroSlogan} heroSubSlogan={heroSubSlogan} />
        <CategoryExplorer onCategoryClick={handleCategoryClick} />
        <FeaturedItems products={featuredProducts} onProductSelect={onProductSelect} savedItems={savedItems} onToggleSave={onToggleSave} currentUser={currentUser} onReportProduct={onReportProduct} />

        <h2 className="text-2xl font-bold text-center text-text-main dark:text-secondary mb-8">Nos derniers articles</h2>
        <div className="flex flex-col lg:flex-row gap-8">
            <aside className="lg:w-1/4">
                <FilterSidebar filters={filters} onFilterChange={setFilters} />
            </aside>
            <section className="lg:w-3/4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayedProducts.map((product, index) => (
                        <div key={`${product.id}-${index}`} className="stagger-in" style={{ animationDelay: `${index * 100}ms`}}>
                            <ProductCard product={product} onClick={() => onProductSelect(product)} isSaved={savedItems.has(product.id)} onToggleSave={onToggleSave} currentUser={currentUser} onReport={onReportProduct} />
                        </div>
                    ))}
                    {isLoading && displayedProducts.length === 0 && Array.from({length: 3}).map((_, i) => <SkeletonCard key={`skeleton-initial-${i}`} />) }
                </div>
                 <div className="text-center py-8">
                    {!isLoading && !hasMore && displayedProducts.length === 0 && (
                        <Card className="py-16">
                            <i className="fa-solid fa-magnifying-glass text-5xl text-gray-300 dark:text-gray-600 mb-4"></i>
                            <p className="text-text-light dark:text-gray-400">Aucun article ne correspond à vos filtres.</p>
                        </Card>
                    )}
                    {!isLoading && !hasMore && displayedProducts.length > 0 &&(
                        <p className="text-text-light dark:text-gray-400">Vous avez tout vu ! 🎉</p>
                    )}
                     {isLoading && displayedProducts.length > 0 && <div className="text-text-light dark:text-gray-400">Chargement...</div>}
                    <div ref={observerRef} style={{ height: '1px' }} />
                </div>
            </section>
        </div>
        <div className="sm:hidden fixed bottom-4 right-4 z-40">
            <button
                className="bg-primary text-white font-bold w-14 h-14 rounded-full shadow-lg flex items-center justify-center"
                onClick={() => onNavigate({name: 'addItem'})}
            >
                <i className="fa-plus text-2xl"></i>
            </button>
        </div>
    </div>
  );
};

export default HomePage;