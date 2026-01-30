import React, { useState, useRef } from 'react';
import type { Product, User } from '../types';
import type { AppSettings } from '../App';
import Rating from '../components/Rating';
import ImageZoomModal from '../components/ImageZoomModal';
import CheckoutModal from '../components/CheckoutModal';
import ShareModal from '../components/ShareModal';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import ProductCard from '../components/ProductCard';
import { ProductStatus } from '../types';


interface ProductDetailPageProps {
  product: Product;
  allProducts: Product[];
  savedItems: Set<string>;
  cartItems: Set<string>;
  onBack: () => void;
  onSellerClick: (seller: User) => void;
  onProductSelect: (product: Product) => void;
  onToggleSave: (productId: string) => void;
  onAddToCart: (productId: string) => void;
  onPurchase: (product: Product, buyerProtectionFee: number, shippingFee: number, totalAmount: number) => void;
  currentUser: User | null;
  onReportProduct: (product: Product) => void;
  onMessageSeller: (recipient: User, product: Product) => void;
  showToast: (message: string, icon: string) => void;
  appSettings: AppSettings;
}

const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ product, allProducts, savedItems, cartItems, onBack, onSellerClick, onProductSelect, onToggleSave, onAddToCart, onPurchase, currentUser, onReportProduct, onMessageSeller, showToast, appSettings }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [isSharingInProgress, setIsSharingInProgress] = useState(false);
  
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const isDeal = product.originalPrice && product.originalPrice > product.price;
  const discountPercentage = isDeal ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100) : 0;
  
  const isSaved = savedItems.has(product.id);
  const isInCart = cartItems.has(product.id);
  const isOwner = currentUser?.id === product.seller.id;
  const isSold = product.status === ProductStatus.Sold;

  const similarProducts = allProducts
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 8);
    
  const handleConfirmPurchase = (product: Product, buyerProtectionFee: number, shippingFee: number, totalAmount: number) => {
    setIsCheckoutOpen(false);
    onPurchase(product, buyerProtectionFee, shippingFee, totalAmount);
  }

  const handleShare = async () => {
    if (isSharingInProgress) return;

    const productUrl = `https://balaoui.ma/product/${product.id}`;
    const shareData = {
      title: product.title,
      text: `Découvrez cet article sur BALAoui : ${product.title}`,
      url: productUrl,
    };

    if (navigator.share) {
      setIsSharingInProgress(true);
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error("Erreur lors du partage:", err);
        // Ne pas ouvrir le modal si l'utilisateur a annulé le partage (AbortError)
        if (err instanceof DOMException && err.name === 'AbortError') {
          // User cancelled the share, do nothing.
        } else {
          setIsSharing(true);
        }
      } finally {
        setIsSharingInProgress(false);
      }
    } else {
      // Fallback for browsers that don't support the Web Share API
      setIsSharing(true);
    }
  };

  const goToNext = () => {
    setCurrentIndex(prevIndex => (prevIndex === product.images.length - 1 ? 0 : prevIndex + 1));
  };

  const goToPrevious = () => {
    setCurrentIndex(prevIndex => (prevIndex === 0 ? product.images.length - 1 : prevIndex - 1));
  };
  
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = 0;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };
  
  const handleTouchEnd = () => {
    if (touchEndX.current === 0) return;
    const diff = touchStartX.current - touchEndX.current;
    const swipeThreshold = 50;

    if (diff > swipeThreshold) {
      goToNext();
    } else if (diff < -swipeThreshold) {
      goToPrevious();
    }
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {isCheckoutOpen && <CheckoutModal product={product} appSettings={appSettings} onClose={() => setIsCheckoutOpen(false)} onConfirmPurchase={handleConfirmPurchase} currentUser={currentUser} />}
      {isSharing && <ShareModal product={product} onClose={() => setIsSharing(false)} />}
      {zoomedImage && <ImageZoomModal imageUrl={zoomedImage} onClose={() => setZoomedImage(null)} />}
      
      <button onClick={onBack} className="text-primary font-semibold mb-6 flex items-center space-x-2 hover:text-primary-dark">
        <i className="fa fa-arrow-left"></i>
        <span>Retour</span>
      </button>

      <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
        {/* Image Gallery */}
        <div className="w-full md:w-1/2">
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden mb-4 relative group"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {isSold && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                    <span className="text-white text-3xl font-bold border-4 border-white px-6 py-3 -rotate-12">VENDU</span>
                </div>
            )}
            <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
                {product.images.map((img, index) => (
                    <div key={index} className="flex-shrink-0 w-full h-[32rem] relative" onClick={() => setZoomedImage(img)}>
                        <img 
                            src={img} 
                            alt={`${product.title} image ${index + 1}`} 
                            className="w-full h-full object-cover cursor-pointer"
                        />
                    </div>
                ))}
            </div>
            
            <div 
                className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center cursor-pointer"
                onClick={() => setZoomedImage(product.images[currentIndex])}
              >
                <i className="fa-solid fa-magnifying-glass-plus text-white text-4xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></i>
            </div>
            
            {isDeal && <Badge variant="destructive" className="absolute top-4 left-4"><i className="fa-solid fa-tag text-xs mr-1.5"></i>Bon Plan (-{discountPercentage}%)</Badge>}
            
             {/* Desktop Navigation Arrows */}
            <div className="hidden md:block">
              <button onClick={(e) => { e.stopPropagation(); goToPrevious(); }} className="absolute top-1/2 left-3 -translate-y-1/2 bg-white/70 dark:bg-gray-900/70 w-10 h-10 rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 disabled:opacity-30">
                <i className="fa-solid fa-chevron-left"></i>
              </button>
              <button onClick={(e) => { e.stopPropagation(); goToNext(); }} className="absolute top-1/2 right-3 -translate-y-1/2 bg-white/70 dark:bg-gray-900/70 w-10 h-10 rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 disabled:opacity-30">
                <i className="fa-solid fa-chevron-right"></i>
              </button>
            </div>
             {/* Mobile Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 md:hidden">
                {product.images.map((_, index) => (
                    <div key={index} className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentIndex ? 'bg-primary scale-125' : 'bg-gray-300'}`}></div>
                ))}
            </div>
          </div>

          <div className="flex space-x-2 overflow-x-auto pb-2">
            {product.images.map((img, index) => (
                <img 
                    key={index} 
                    src={img} 
                    alt={`thumbnail ${index}`}
                    className={`w-20 h-20 object-cover rounded-md cursor-pointer border-2 ${index === currentIndex ? 'border-primary' : 'border-transparent'}`}
                    onClick={() => setCurrentIndex(index)}
                />
            ))}
          </div>
        </div>

        {/* Product Details */}
        <div className="w-full md:w-1/2">
            <h1 className="text-3xl font-bold text-text-main dark:text-secondary mb-2">{product.title}</h1>
            <div className="flex items-baseline gap-3 mb-4">
                <p className="text-3xl font-bold text-primary dark:text-teal-400">{product.price} MAD</p>
                {isDeal && <p className="text-lg text-text-light dark:text-gray-400 line-through">{product.originalPrice} MAD</p>}
            </div>

            <div className="space-y-4 py-4 border-y dark:border-gray-700">
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="font-semibold text-text-light dark:text-gray-400">Catégorie:</span> <span className="text-text-main dark:text-secondary">{product.category}</span></div>
                    <div><span className="font-semibold text-text-light dark:text-gray-400">État:</span> <span className="text-text-main dark:text-secondary">{product.condition}</span></div>
                    {product.size && <div><span className="font-semibold text-text-light dark:text-gray-400">Taille:</span> <span className="text-text-main dark:text-secondary">{product.size}</span></div>}
                    <div><span className="font-semibold text-text-light dark:text-gray-400">Ville:</span> <span className="text-text-main dark:text-secondary">{product.city}</span></div>
                </div>
            </div>

            <p className="text-text-main dark:text-gray-300 mt-4 leading-relaxed">{product.description}</p>
            
            {/* Seller Info */}
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-between">
                <div className="flex items-center space-x-4 cursor-pointer" onClick={() => onSellerClick(product.seller)}>
                    <img src={product.seller.avatarUrl} alt={product.seller.name} className="w-12 h-12 rounded-full" />
                    <div>
                        <p className="font-bold text-text-main dark:text-secondary">{product.seller.name}</p>
                        <div className="flex items-center space-x-1">
                            <Rating rating={product.seller.rating} />
                            <span className="text-xs text-text-light dark:text-gray-400">({product.seller.reviews} avis)</span>
                        </div>
                    </div>
                </div>
                {!isOwner && <Button variant="outline" onClick={(e) => { e.stopPropagation(); onSellerClick(product.seller); }}>Voir le profil</Button>}
            </div>
            
            {/* Action Buttons */}
            <div className="mt-6">
                <div className="flex flex-col sm:flex-row gap-3">
                    {!isOwner ? (
                        isSold ? (
                            <Button variant="outline" className="flex-1 h-12" disabled>Cet article a été vendu</Button>
                        ) : (
                            <>
                                <Button className="flex-1 h-12" onClick={() => setIsCheckoutOpen(true)}>
                                    <i className="fa-solid fa-shield-halved mr-2"></i>Acheter
                                </Button>
                                <Button variant="outline" className="h-12 w-16" onClick={() => onAddToCart(product.id)} disabled={isInCart} aria-label="Ajouter au panier">
                                    <i className={`fa-solid ${isInCart ? 'fa-check' : 'fa-cart-plus'} text-xl`}></i>
                                </Button>
                            </>
                        )
                    ) : (
                        <Button variant="outline" className="flex-1 h-12" disabled>C'est votre article</Button>
                    )}
                    <Button variant="ghost" className="h-12 w-12 sm:w-auto" onClick={() => onToggleSave(product.id)} aria-label="Sauvegarder">
                        <i className={`${isSaved ? 'fa-solid text-red-500' : 'fa-regular'} fa-heart text-xl`}></i>
                    </Button>
                    <Button variant="ghost" className="h-12 w-12 sm:w-auto" onClick={handleShare} aria-label="Partager" disabled={isSharingInProgress}>
                        <i className="fa-solid fa-share-nodes text-xl"></i>
                    </Button>
                </div>
                 {!isOwner && !isSold && (
                    <Button variant="outline" className="w-full mt-3 h-12" onClick={() => onMessageSeller(product.seller, product)}>
                        <i className="fa-regular fa-comments mr-2"></i>Contacter le vendeur
                    </Button>
                 )}
            </div>
        </div>
      </div>

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <div className="mt-16">
            <h2 className="text-2xl font-bold text-text-main dark:text-secondary mb-6">Articles similaires</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {similarProducts.map(p => (
                    <ProductCard 
                        key={p.id} 
                        product={p} 
                        onClick={() => onProductSelect(p)} 
                        isSaved={savedItems.has(p.id)}
                        onToggleSave={onToggleSave}
                        currentUser={currentUser}
                        onReport={onReportProduct}
                    />
                ))}
            </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;