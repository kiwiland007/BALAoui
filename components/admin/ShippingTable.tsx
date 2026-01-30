import React, { useState } from 'react';
import type { Order } from '../../types';
import { OrderStatus } from '../../types';
import { CardHeader, CardTitle, CardContent, CardDescription } from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

interface ShippingTableProps {
    orders: Order[];
    onUpdateShipping: (orderId: string, trackingNumber: string, shippingProvider: string) => void;
}

const ShippingTable: React.FC<ShippingTableProps> = ({ orders, onUpdateShipping }) => {
    const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
    const [trackingNumber, setTrackingNumber] = useState('');
    const [provider, setProvider] = useState('');

    const handleStartShip = (order: Order) => {
        setEditingOrderId(order.id);
        setTrackingNumber(order.trackingNumber || '');
        setProvider(order.shippingProvider || 'Amana'); // Default provider for Morocco
    };

    const handleSave = (orderId: string) => {
        if (!trackingNumber || !provider) return;
        onUpdateShipping(orderId, trackingNumber, provider);
        setEditingOrderId(null);
    };

    return (
        <>
            <CardHeader>
                <CardTitle>Gestion des Expéditions</CardTitle>
                <CardDescription>Gérez les numéros de suivi et les expéditions des commandes.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">Commande</th>
                                <th scope="col" className="px-6 py-3">Vendeur</th>
                                <th scope="col" className="px-6 py-3">Acheteur</th>
                                <th scope="col" className="px-6 py-3">Statut</th>
                                <th scope="col" className="px-6 py-3">Expédition</th>
                                <th scope="col" className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.filter(o => o.status !== OrderStatus.PendingPayment && o.status !== OrderStatus.Cancelled).map(order => (
                                <tr key={order.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        <div className="flex flex-col">
                                            <span className="text-xs text-text-light">#{order.id.slice(0, 8)}</span>
                                            <span>{order.product.title}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">{order.seller.name}</td>
                                    <td className="px-6 py-4">{order.buyer.name}</td>
                                    <td className="px-6 py-4">
                                        <Badge variant={
                                            order.status === OrderStatus.Paid ? 'default' :
                                                order.status === OrderStatus.Shipped ? 'secondary' : 'default'
                                        }>
                                            {order.status}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4">
                                        {editingOrderId === order.id ? (
                                            <div className="flex flex-col space-y-2">
                                                <input
                                                    className="text-xs p-1 border rounded dark:bg-gray-700 dark:border-gray-600"
                                                    placeholder="N° de suivi"
                                                    value={trackingNumber}
                                                    onChange={(e) => setTrackingNumber(e.target.value)}
                                                />
                                                <select
                                                    className="text-xs p-1 border rounded dark:bg-gray-700 dark:border-gray-600"
                                                    value={provider}
                                                    onChange={(e) => setProvider(e.target.value)}
                                                >
                                                    <option value="Amana">Amana</option>
                                                    <option value="Aramex">Aramex</option>
                                                    <option value="DHL">DHL</option>
                                                    <option value="Cat-Logistique">Cat-Logistique</option>
                                                    <option value="Autre">Autre</option>
                                                </select>
                                            </div>
                                        ) : (
                                            <div className="text-xs">
                                                {order.trackingNumber ? (
                                                    <>
                                                        <div className="font-semibold">{order.shippingProvider}</div>
                                                        <div className="text-text-light">{order.trackingNumber}</div>
                                                    </>
                                                ) : (
                                                    <span className="text-gray-400 italic">Non expédié</span>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {editingOrderId === order.id ? (
                                            <div className="flex space-x-2">
                                                <Button size="sm" onClick={() => handleSave(order.id)}>Enregistrer</Button>
                                                <Button size="sm" variant="ghost" onClick={() => setEditingOrderId(null)}>Annuler</Button>
                                            </div>
                                        ) : (
                                            <Button size="sm" variant="outline" onClick={() => handleStartShip(order)}>
                                                {order.trackingNumber ? 'Modifier Suivi' : 'Expédier'}
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </>
    );
};

export default ShippingTable;
