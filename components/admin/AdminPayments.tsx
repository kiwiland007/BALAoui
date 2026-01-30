import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Switch from '../ui/Switch';
import type { AppSettings } from '../../App';

interface AdminPaymentsProps {
    showToast: (message: string, icon: string) => void;
    settings: AppSettings;
    onSave: (newSettings: AppSettings) => void;
}

const AdminPayments: React.FC<AdminPaymentsProps> = ({ showToast, settings, onSave }) => {
    const handleToggle = (method: keyof typeof settings.paymentMethods) => {
        const newSettings = {
            ...settings,
            paymentMethods: {
                ...settings.paymentMethods,
                [method]: !settings.paymentMethods[method]
            }
        };
        onSave(newSettings);
        showToast('Paramètres de paiement mis à jour', 'fa-solid fa-check-circle');
    };

    return (
        <div className="max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Section 1: Gateways */}
            <div className="space-y-6">
                <h2 className="text-xl font-bold text-text-main dark:text-secondary">Passerelles de Paiement</h2>
                <Card>
                    <CardHeader className="flex flex-row items-start justify-between">
                        <div>
                            <CardTitle>CMI (Maroc)</CardTitle>
                            <CardDescription>Recommandé pour le Maroc</CardDescription>
                        </div>
                        <Badge variant="default">Connecté</Badge>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-text-light dark:text-gray-400">Clé API: <code className="text-xs bg-gray-100 dark:bg-gray-700 p-1 rounded">cmi_sk_live_••••••••••••</code></p>
                        <Button variant="ghost" disabled className="mt-4 h-9 px-4 text-xs">Gérer l'intégration</Button>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-start justify-between">
                        <div>
                            <CardTitle>Stripe</CardTitle>
                            <CardDescription>International</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-text-light dark:text-gray-400">Connectez Stripe pour accepter les paiements internationaux.</p>
                        <Button variant="outline" className="mt-4 h-9 px-4" onClick={() => showToast('Intégration Stripe non disponible.', 'fa-solid fa-info-circle')}>Se connecter à Stripe</Button>
                    </CardContent>
                </Card>
            </div>

            {/* Section 2: On-site methods */}
            <div>
                <h2 className="text-xl font-bold text-text-main dark:text-secondary mb-6">Méthodes Disponibles</h2>
                <Card>
                    <CardContent className="p-6 divide-y divide-gray-200 dark:divide-gray-700">
                        <div className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                            <div>
                                <h4 className="font-semibold text-text-main dark:text-secondary">Carte Bancaire</h4>
                                <p className="text-sm text-text-light dark:text-gray-400">Via CMI (Nécessite une passerelle active)</p>
                            </div>
                            <Switch id="card-switch" checked={settings.paymentMethods.card} onChange={() => handleToggle('card')} />
                        </div>
                        <div className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                            <div>
                                <h4 className="font-semibold text-text-main dark:text-secondary">Solde BALAoui</h4>
                                <p className="text-sm text-text-light dark:text-gray-400">Portefeuille interne de la plateforme</p>
                            </div>
                            <Switch id="balance-switch" checked={settings.paymentMethods.balance} onChange={() => handleToggle('balance')} />
                        </div>
                        <div className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                            <div>
                                <h4 className="font-semibold text-text-main dark:text-secondary">Paiement à la livraison</h4>
                                <p className="text-sm text-text-light dark:text-gray-400">Option manuelle gérée par les utilisateurs</p>
                            </div>
                            <Switch id="cod-switch" checked={settings.paymentMethods.cod} onChange={() => handleToggle('cod')} />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AdminPayments;