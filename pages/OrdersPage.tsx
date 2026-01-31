
import React from 'react';
import type { User, Order, View } from '../types';
import { OrderStatus } from '../types';
import { Card } from '../components/ui/Card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import Button from '../components/ui/Button';

interface OrdersPageProps {
    currentUser: User;
    orders: Order[];
    showToast: (message: string, icon: string) => void;
    onNavigate: (view: View) => void;
    onUpdateStatus: (orderId: string, status: OrderStatus) => void;
}

const OrderCard: React.FC<{
    order: Order,
    type: 'purchase' | 'sale',
    onNavigate: (view: View) => void,
    showToast: (message: string, icon: string) => void,
    onUpdateStatus: (orderId: string, status: OrderStatus) => void
}> = ({ order, type, onNavigate, showToast, onUpdateStatus }) => {
    const otherParty = type === 'purchase' ? order.seller : order.buyer;

    const getStatusInfo = (status: OrderStatus) => {
        switch (status) {
            case OrderStatus.Paid: return { text: 'Payée', icon: 'fa-credit-card', color: 'text-blue-500' };
            case OrderStatus.Shipped: return { text: 'Expédiée', icon: 'fa-truck-fast', color: 'text-orange-500' };
            case OrderStatus.Delivered: return { text: 'Livrée', icon: 'fa-box-open', color: 'text-purple-500' };
            case OrderStatus.Completed: return { text: 'Terminée', icon: 'fa-check-circle', color: 'text-green-500' };
            case OrderStatus.Cancelled: return { text: 'Annulée', icon: 'fa-times-circle', color: 'text-red-500' };
            default: return { text: status, icon: 'fa-question-circle', color: 'text-gray-500' };
        }
    }
    const statusInfo = getStatusInfo(order.status);

    const handleDownloadLabel = () => {
        showToast("Bordereau d'envoi téléchargé !", "fa-solid fa-file-arrow-down");
    }

    const handleConfirmReception = () => {
        onUpdateStatus(order.id, OrderStatus.Delivered);
    }

    return (
        <Card className="p-4 flex flex-col sm:flex-row gap-4">
            <img
                src={order.product.images[0]}
                alt={order.product.title}
                className="w-full sm:w-24 h-32 sm:h-24 object-cover rounded-md cursor-pointer"
                onClick={() => onNavigate({ name: 'productDetail', product: order.product })}
            />
            <div className="flex-grow">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-sm text-text-light dark:text-gray-400">Commande #{order.id}</p>
                        <h3 className="font-semibold text-text-main dark:text-secondary">{order.product.title}</h3>
                        <p className="text-sm text-text-light dark:text-gray-400">
                            {type === 'purchase' ? 'Vendu par' : 'Acheté par'} <span className="font-medium text-primary cursor-pointer" onClick={() => onNavigate({ name: 'profile', user: otherParty })}>{otherParty.name}</span>
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="font-bold text-lg text-primary">{order.totalAmount.toFixed(2)} MAD</p>
                        <p className={`text-sm font-semibold flex items-center justify-end space-x-2 ${statusInfo.color}`}>
                            <i className={`fa-solid ${statusInfo.icon}`}></i>
                            <span>{statusInfo.text}</span>
                        </p>
                        {order.selectedShippingMethod && (
                            <p className="text-[10px] uppercase font-bold text-text-light dark:text-gray-500 mt-1">
                                {order.selectedShippingMethod}
                            </p>
                        )}
                    </div>
                </div>
                {order.trackingNumber && (
                    <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-100 dark:border-gray-700 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <i className="fa-solid fa-truck text-primary"></i>
                            <div>
                                <p className="text-xs font-semibold text-text-main dark:text-secondary">{order.shippingProvider}</p>
                                <p className="text-xs text-text-light">{order.trackingNumber}</p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-[10px]"
                            onClick={() => window.open(`https://www.google.com/search?q=${order.trackingNumber}+tracking`, '_blank')}
                        >
                            Suivre le colis
                        </Button>
                    </div>
                )}
                <div className="mt-4 pt-3 border-t dark:border-gray-700 flex justify-end space-x-2">
                    {type === 'sale' && order.status === OrderStatus.Paid && <Button onClick={handleDownloadLabel} className="h-8 px-3 text-xs">Télécharger le bordereau</Button>}
                    {type === 'purchase' && (order.status === OrderStatus.Delivered || order.status === OrderStatus.Shipped) && <Button onClick={handleConfirmReception} className="h-8 px-3 text-xs">Confirmer la réception</Button>}
                    <Button variant="outline" className="h-8 px-3 text-xs" onClick={() => onNavigate({ name: 'chat', recipient: otherParty, product: order.product })}>Contacter</Button>
                </div>
            </div>
        </Card>
    );
}

const OrdersPage: React.FC<OrdersPageProps> = ({ currentUser, orders, showToast, onNavigate, onUpdateStatus }) => {
    const purchases = orders.filter(o => o.buyer.id === currentUser.id);
    const sales = orders.filter(o => o.seller.id === currentUser.id);

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-text-main dark:text-secondary mb-8">Mes Commandes</h1>

            <Tabs defaultValue="purchases">
                <TabsList>
                    <TabsTrigger value="purchases">Mes Achats ({purchases.length})</TabsTrigger>
                    <TabsTrigger value="sales">Mes Ventes ({sales.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="purchases" className="mt-8">
                    {purchases.length > 0 ? (
                        <div className="space-y-4">
                            {purchases.map(order => <OrderCard key={order.id} order={order} type="purchase" onNavigate={onNavigate} showToast={showToast} onUpdateStatus={onUpdateStatus} />)}
                        </div>
                    ) : (
                        <Card className="text-center py-20 px-6">
                            <i className="fa-solid fa-cart-shopping text-6xl text-gray-300 dark:text-gray-600 mb-4"></i>
                            <h2 className="text-2xl font-bold text-text-main dark:text-secondary">Aucun achat pour le moment</h2>
                            <p className="text-text-light dark:text-gray-400 mt-2 mb-6 max-w-md mx-auto">
                                Les articles que vous achetez via le paiement sécurisé apparaîtront ici.
                            </p>
                            <Button onClick={() => onNavigate({ name: 'home' })} className="h-11 px-6">
                                Commencer à shopper
                            </Button>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="sales" className="mt-8">
                    {sales.length > 0 ? (
                        <div className="space-y-4">
                            {sales.map(order => <OrderCard key={order.id} order={order} type="sale" onNavigate={onNavigate} showToast={showToast} onUpdateStatus={onUpdateStatus} />)}
                        </div>
                    ) : (
                        <Card className="text-center py-20 px-6">
                            <i className="fa-solid fa-tag text-6xl text-gray-300 dark:text-gray-600 mb-4"></i>
                            <h2 className="text-2xl font-bold text-text-main dark:text-secondary">Aucune vente pour le moment</h2>
                            <p className="text-text-light dark:text-gray-400 mt-2 mb-6 max-w-md mx-auto">
                                Lorsque vous réaliserez une vente, vous pourrez la suivre ici.
                            </p>
                            <Button onClick={() => onNavigate({ name: 'addItem' })} className="h-11 px-6">
                                Vendre un article
                            </Button>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default OrdersPage;
