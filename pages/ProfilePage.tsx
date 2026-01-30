
import React, { useState } from 'react';
import type { User, Product, View } from '../types';
import type { AppSettings } from '../App';
import { mockReviews } from '../constants';
import Rating from '../components/Rating';
import ProductCard from '../components/ProductCard';
import ReviewCard from '../components/ReviewCard';
import BoostModal from '../components/BoostModal';
import ConfirmationModal from '../components/ConfirmationModal';
import { Card } from '../components/ui/Card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

interface ProfilePageProps {
  user: User;
  allProducts: Product[];
  onProductSelect: (product: Product) => void;
  onBoostProduct: (productId: string, option: 'bump' | 'feature', paymentMethod: 'card' | 'balance') => void;
  onDeleteProduct: (productId: string) => void;
  onEditProduct: (product: Product) => void;
  savedItems: Set<string>;
  onToggleSave: (productId: string) => void;
  appSettings: AppSettings;
  currentUser: User | null;
  onReportProduct: (product: Product) => void;
  onOpenAddBalance: () => void;
  onOpenProModal: () => void;
  onNavigate: (view: View) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user, allProducts, onProductSelect, onBoostProduct, onDeleteProduct, onEditProduct, savedItems, onToggleSave, appSettings, currentUser, onReportProduct, onOpenAddBalance, onOpenProModal, onNavigate }) => {
  const [productToBoost, setProductToBoost] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const userProducts = allProducts.filter(p => p.seller.id === user.id);
  const reviews = user.id === 'u1' ? mockReviews : []; // Show mock reviews for one user only
  const isOwnProfile = user.id === currentUser?.id;

  const handleConfirmBoost = (productId: string, option: 'bump' | 'feature', paymentMethod: 'card' | 'balance') => {
    onBoostProduct(productId, option, paymentMethod);
    setProductToBoost(null); // Close modal after action
  };
  
  const handleConfirmDelete = () => {
    if (productToDelete) {
      onDeleteProduct(productToDelete.id);
      setProductToDelete(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {productToBoost && currentUser && <BoostModal product={productToBoost} onClose={() => setProductToBoost(null)} onConfirmBoost={handleConfirmBoost} settings={appSettings} currentUser={currentUser} />}
      {productToDelete && (
        <ConfirmationModal
          title="Confirmer la suppression"
          onClose={() => setProductToDelete(null)}
          onConfirm={handleConfirmDelete}
          confirmText="Supprimer"
        >
          Êtes-vous sûr de vouloir supprimer l'article "{productToDelete.title}" ? Cette action est irréversible.
        </ConfirmationModal>
      )}
      
      {/* Profile Header */}
      <Card className="p-6 mb-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start sm:space-x-6">
          <img src={user.avatarUrl} alt={user.name} className="w-28 h-28 rounded-full mb-4 sm:mb-0 border-4 border-white dark:border-gray-700 shadow-md" />
          <div className="text-center sm:text-left flex-grow">
            <div className="flex items-center justify-center sm:justify-start space-x-3">
              <h1 className="text-3xl font-bold text-text-main dark:text-secondary">{user.name}</h1>
              {user.isPro && <Badge className="border-accent bg-accent/10 text-accent dark:text-accent py-1"><i className="fa-solid fa-crown text-xs mr-1.5"></i>Vendeur Pro</Badge>}
            </div>
            <div className="flex items-center justify-center sm:justify-start space-x-2 mt-1">
              <Rating rating={user.rating} />
              <span className="text-text-light dark:text-gray-400">({user.reviews} avis)</span>
            </div>
            <div className="mt-3 text-text-light dark:text-gray-400 space-y-1">
                <p>
                    <i className="fa-solid fa-location-dot mr-2 w-4 text-center"></i>{user.city}
                </p>
                <p>
                    <i className="fa-solid fa-user-plus mr-2 w-4 text-center"></i>Membre depuis {user.memberSince}
                </p>
            </div>
            {isOwnProfile && 
                <Button onClick={() => onNavigate({name: 'orders'})} variant="outline" className="mt-4 h-9 px-4 text-xs">
                    <i className="fa-solid fa-box-archive mr-2"></i>Mes Commandes
                </Button>
            }
          </div>
          {isOwnProfile && (
            <div className="text-center sm:text-right mt-4 sm:mt-0">
                <p className="text-sm text-text-light dark:text-gray-400">Mon Solde</p>
                <p className="text-2xl font-bold text-primary dark:text-teal-400">{user.balance.toFixed(2)} MAD</p>
                <Button onClick={onOpenAddBalance} variant="outline" className="mt-2 h-9 px-4 text-xs">
                    <i className="fa-solid fa-plus mr-2"></i>Recharger
                </Button>
            </div>
          )}
        </div>
      </Card>
      
      {isOwnProfile && !user.isPro && (
        <div className="bg-gradient-to-r from-teal-50 to-orange-50 dark:from-blue-900/40 dark:to-orange-900/40 p-6 rounded-lg mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
                <div className="bg-white dark:bg-gray-800 rounded-full h-14 w-14 flex items-center justify-center">
                    <i className="fa-solid fa-crown text-3xl text-accent"></i>
                </div>
                <div>
                    <h3 className="text-xl font-bold text-text-main dark:text-secondary">Passez Vendeur Pro !</h3>
                    <p className="text-text-light dark:text-gray-300">Vendez plus vite avec une commission réduite et un badge de confiance.</p>
                </div>
            </div>
            <Button onClick={onOpenProModal} className="h-11 px-6 text-white bg-gradient-to-r from-primary to-accent hover:from-primary-dark hover:to-accent-dark">
                Découvrir les avantages
            </Button>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="articles">
        <TabsList>
          <TabsTrigger value="articles">Articles ({userProducts.length})</TabsTrigger>
          <TabsTrigger value="reviews">Évaluations ({reviews.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="articles" className="mt-8">
           {userProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {userProducts.map(product => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    onClick={() => onProductSelect(product)} 
                    showActions={isOwnProfile}
                    onBoost={setProductToBoost}
                    onDelete={setProductToDelete}
                    onEdit={onEditProduct}
                    isSaved={savedItems.has(product.id)}
                    onToggleSave={onToggleSave}
                    currentUser={currentUser}
                    onReport={onReportProduct}
                  />
                ))}
              </div>
            ) : (
              <Card className="text-center py-16">
                <i className="fa-solid fa-box-open text-5xl text-gray-300 dark:text-gray-600 mb-4"></i>
                <p className="text-text-light dark:text-gray-400">{user.name} n'a aucun article en vente pour le moment.</p>
              </Card>
            )
          }
        </TabsContent>
        <TabsContent value="reviews" className="mt-8">
            {reviews.length > 0 ? (
              <div className="space-y-4 max-w-3xl mx-auto">
                {reviews.map(review => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            ) : (
              <Card className="text-center py-16">
                  <i className="fa-solid fa-comment-slash text-5xl text-gray-300 dark:text-gray-600 mb-4"></i>
                  <p className="text-text-light dark:text-gray-400">Aucune évaluation pour le moment.</p>
              </Card>
            )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfilePage;
