import React, { useState, useRef, useEffect } from 'react';
import type { Product, User } from '../types';
import Button from './ui/Button';
import Badge from './ui/Badge';
import { Card, CardContent } from './ui/Card';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
  showActions?: boolean;
  onBoost?: (product: Product) => void;
  onDelete?: (product: Product) => void;
  onEdit?: (product: Product) => void;
  isSaved: boolean;
  onToggleSave: (productId: string) => void;
  currentUser: User | null;
  onReport: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick, showActions = false, onBoost, onDelete, onEdit, isSaved, onToggleSave, currentUser, onReport }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
            setIsMenuOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(prev => !prev);
  };
  
  const handleBoostClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onBoost) onBoost(product);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) onEdit(product);
  };
  
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) onDelete(product);
  };
  
  const handleSaveClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onToggleSave(product.id);
  }
  
  const handleReportClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onReport(product);
      setIsMenuOpen(false);
  }

  const boostedUntilDate = product.boostedUntil ? new Date(product.boostedUntil) : null;
  const isCurrentlyBoosted = boostedUntilDate && boostedUntilDate > new Date();
  
  const isDeal = product.originalPrice && product.originalPrice > product.price;
  const discountPercentage = isDeal ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100) : 0;

  const isOwner = currentUser?.id === product.seller.id;

  return (
    <Card className="overflow-hidden group transition-all duration-300 hover:shadow-lg hover:border-primary flex flex-col">
      <div className="relative cursor-pointer" onClick={onClick}>
        <img src={product.images[0]} alt={product.title} className="w-full h-72 object-cover" />
        
        <div className="absolute top-3 right-3 flex items-center space-x-2">
            {!isOwner && (
                 <div className="relative" ref={menuRef}>
                    <button
                        onClick={handleMenuToggle}
                        className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm w-10 h-10 rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                        aria-label="Plus d'options"
                    >
                        <i className="fa-solid fa-ellipsis-vertical text-text-main dark:text-secondary text-lg"></i>
                    </button>
                    {isMenuOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 overflow-hidden animate-slide-down z-10">
                            <button
                                onClick={handleReportClick}
                                className="w-full text-left px-4 py-2 text-sm text-text-main dark:text-secondary hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-3"
                            >
                                <i className="fa-regular fa-flag w-4"></i>
                                <span>Signaler l'article</span>
                            </button>
                        </div>
                    )}
                </div>
            )}
            <button 
                onClick={handleSaveClick}
                className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm w-10 h-10 rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                aria-label="Sauvegarder l'article"
            >
              <i className={`${isSaved ? 'fa-solid text-red-500' : 'fa-regular'} fa-heart text-text-main dark:text-secondary text-lg`}></i>
            </button>
        </div>
        
        <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.isFeatured && <Badge variant="secondary"><i className="fa-solid fa-star text-xs mr-1.5"></i>Sponsorisé</Badge>}
            {isDeal && <Badge variant="destructive"><i className="fa-solid fa-tag text-xs mr-1.5"></i>Bon Plan (-{discountPercentage}%)</Badge>}
        </div>
      </div>
      <CardContent className="p-4 flex-grow flex flex-col cursor-pointer" onClick={onClick}>
        <div className="flex-grow">
          <div className="flex items-baseline gap-2 mb-2">
            <p className="text-xl font-bold text-primary dark:text-teal-400">{product.price} MAD</p>
            {isDeal && <p className="text-sm text-text-light dark:text-gray-400 line-through">{product.originalPrice} MAD</p>}
          </div>
          <h3 className="text-md text-text-main dark:text-secondary font-semibold truncate">{product.title}</h3>
          <p className="text-sm text-text-light dark:text-gray-400">{product.city}</p>
          {isCurrentlyBoosted && (
             <div className="mt-2">
                <div className="inline-flex items-center space-x-1.5 text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-400 px-2 py-0.5 rounded-full">
                    <i className="fa-solid fa-rocket"></i>
                    <span>Boosté</span>
                </div>
             </div>
          )}
        </div>
        <div className="flex items-center space-x-2 text-sm text-text-light dark:text-gray-400 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            <img src={product.seller.avatarUrl} alt={product.seller.name} className="w-6 h-6 rounded-full" />
            <span className="truncate">{product.seller.name}</span>
            {product.seller.isPro && <i className="fa-solid fa-crown text-amber-500 text-xs" title="Vendeur Pro"></i>}
        </div>
      </CardContent>
      {showActions && (
        <div className="p-1 border-t border-gray-100 dark:border-gray-700 grid grid-cols-3 gap-1">
            {isCurrentlyBoosted ? (
                <div className="flex items-center justify-center text-xs font-semibold text-green-600 dark:text-green-500" title="Article promu">
                    <i className="fa-solid fa-check-circle"></i>
                </div>
            ) : (
                <Button variant="ghost" className="w-full h-8 text-xs" onClick={handleBoostClick} title="Bump">
                    <i className="fa-solid fa-arrow-up"></i>
                </Button>
            )}
            <Button variant="ghost" className="w-full h-8 text-xs" onClick={handleEditClick} title="Modifier">
                <i className="fa-solid fa-pencil"></i>
            </Button>
            <Button variant="ghost" className="w-full h-8 text-xs text-red-500 hover:bg-red-500/10 dark:hover:bg-red-500/20" onClick={handleDeleteClick} title="Supprimer">
                <i className="fa-solid fa-trash-can"></i>
            </Button>
        </div>
      )}
    </Card>
  );
};

export default ProductCard;