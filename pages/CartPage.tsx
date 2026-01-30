import React, { useMemo, useState } from 'react';
import type { User, Product, View } from '../types';
import type { AppSettings } from '../App';
import { Card } from '../components/ui/Card';
import Button from '../components/ui/Button';
import CheckoutModal from '../components/CheckoutModal';

interface CartPageProps {
  currentUser: User;
  cartItems: Set<string>;
  allProducts: Product[];
  onRemoveFromCart: (productId: string) => void;
  onPurchase: (product: Product, buyerProtectionFee: number, shippingFee: number, totalAmount: number) => void;
  onNavigate: (view: View) => void;
  appSettings: AppSettings;
}

const CartPage: React.FC<CartPageProps> = ({ currentUser, cartItems, allProducts, onRemoveFromCart, onPurchase, onNavigate, appSettings }) => {
    const cartProducts = useMemo(() => allProducts.filter(p => cartItems.has(p.id)), [allProducts, cartItems]);
    
    const [productToCheckout, setProductToCheckout] = useState<Product | null>(null);

    const subtotal = useMemo(() => cartProducts.reduce((sum, p) => sum + p.price, 0), [cartProducts]);
    const itemsCount = cartProducts.length;

    const handleConfirmPurchase = (product: Product, buyerProtectionFee: number, shippingFee: number, totalAmount: number) => {
        setProductToCheckout(null);
        onPurchase(product, buyerProtectionFee, shippingFee, totalAmount);
        onRemoveFromCart(product.id);
    };

    if (itemsCount === 0) {
        return (
            <div className="container mx-auto px-4 py-8">
                 <Card className="text-center py-20 px-6">
                    <i className="fa-solid fa-cart-shopping text-6xl text-gray-300 dark:text-gray-600 mb-4"></i>
                    <h2 className="text-2xl font-bold text-text-main dark:text-secondary">Votre panier est vide</h2>
                    <p className="text-text-light dark:text-gray-400 mt-2 mb-6 max-w-md mx-auto">
                        Parcourez nos articles et ajoutez vos trouvailles pour les acheter plus tard.
                    </p>
                    <Button onClick={() => onNavigate({ name: 'home' })} className="h-11 px-6">
                        Découvrir des articles
                    </Button>
                </Card>
            </div>
        );
    }
    
    return (
        <div className="container mx-auto px-4 py-8">
            {productToCheckout && <CheckoutModal product={productToCheckout} appSettings={appSettings} onClose={() => setProductToCheckout(null)} onConfirmPurchase={handleConfirmPurchase} currentUser={currentUser} />}

            <h1 className="text-3xl font-bold text-text-main dark:text-secondary mb-8">Mon Panier ({itemsCount})</h1>

            <div className="flex flex-col lg:flex-row gap-8 items-start">
                {/* Cart Items */}
                <div className="lg:w-2/3 w-full space-y-4">
                    {cartProducts.map(product => (
                        <Card key={product.id} className="p-4 flex flex-col sm:flex-row gap-4">
                            <img 
                                src={product.images[0]} 
                                alt={product.title} 
                                className="w-full sm:w-28 h-40 sm:h-28 object-cover rounded-md cursor-pointer"
                                onClick={() => onNavigate({ name: 'productDetail', product: product })}
                            />
                            <div className="flex-grow flex flex-col">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold text-text-main dark:text-secondary">{product.title}</h3>
                                        <p className="text-sm text-text-light dark:text-gray-400">
                                            Vendu par <span className="font-medium text-primary cursor-pointer" onClick={() => onNavigate({name: 'profile', user: product.seller})}>{product.seller.name}</span>
                                        </p>
                                    </div>
                                    <p className="font-bold text-lg text-primary">{product.price.toFixed(2)} MAD</p>
                                </div>
                                <div className="flex-grow"></div>
                                <div className="flex items-center justify-end space-x-2 mt-2">
                                    <Button variant="ghost" className="h-9 px-3 text-red-500 hover:bg-red-500/10 dark:hover:bg-red-500/20" onClick={() => onRemoveFromCart(product.id)}>
                                        <i className="fa-solid fa-trash-can mr-2"></i>Retirer
                                    </Button>
                                    <Button className="h-9 px-4" onClick={() => setProductToCheckout(product)}>
                                        Acheter
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Summary */}
                <div className="lg:w-1/3 w-full">
                    <Card className="p-6 sticky top-28">
                        <h2 className="text-xl font-bold text-text-main dark:text-secondary mb-4">Résumé</h2>
                        <div className="space-y-2 text-sm border-t dark:border-gray-700 pt-4">
                            <div className="flex justify-between">
                                <span className="text-text-light dark:text-gray-400">Sous-total ({itemsCount} article{itemsCount > 1 ? 's' : ''})</span>
                                <span className="font-medium text-text-main dark:text-secondary">{subtotal.toFixed(2)} MAD</span>
                            </div>
                             <p className="text-xs text-text-light dark:text-gray-400 pt-2">
                                Les frais de port et la protection acheteurs seront calculés pour chaque article lors du paiement.
                            </p>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
