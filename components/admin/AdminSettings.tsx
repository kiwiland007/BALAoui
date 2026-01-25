import React, { useState, useEffect } from 'react';
import type { AppSettings } from '../../App';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '../ui/Card';
import Button from '../ui/Button';

interface AdminSettingsProps {
    settings: AppSettings;
    onSave: (newSettings: AppSettings) => void;
}

const AdminSettings: React.FC<AdminSettingsProps> = ({ settings, onSave }) => {
    const [currentSettings, setCurrentSettings] = useState<AppSettings>(settings);
    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        setIsDirty(JSON.stringify(settings) !== JSON.stringify(currentSettings));
    }, [settings, currentSettings]);

    const handleSave = () => {
        onSave(currentSettings);
    };
    
    const handleReset = () => {
        setCurrentSettings(settings);
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setCurrentSettings(prev => ({
            ...prev,
            [name]: type === 'range' ? parseFloat(value) : (value === '' ? '' : parseFloat(value)),
        }));
    };

    const inputClasses = "block w-24 px-3 py-2 bg-inherit border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-center";
    const sliderClasses = "w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary";

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* General Settings Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Paramètres Généraux</CardTitle>
                    <CardDescription>Configurez les frais et les prix des services de base.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <label htmlFor="commission" className="flex items-center space-x-2 text-sm font-medium text-text-main dark:text-secondary">
                            <i className="fa-solid fa-percent w-4 text-center text-text-light"></i>
                            <span>Commission de base (%)</span>
                        </label>
                        <div className="flex items-center space-x-4 mt-1">
                             <input 
                                type="number"
                                id="commission"
                                name="commission"
                                value={currentSettings.commission}
                                onChange={handleChange}
                                className={inputClasses}
                                step="0.5"
                                min="0"
                                max="20"
                            />
                            <input type="range" min="0" max="20" step="0.5" name="commission" value={currentSettings.commission} onChange={handleChange} className={sliderClasses} />
                        </div>
                        <p className="mt-2 text-xs text-text-light dark:text-gray-400">Le pourcentage prélevé sur les ventes des vendeurs standards.</p>
                    </div>
                     <div>
                        <label htmlFor="bumpPrice" className="flex items-center space-x-2 text-sm font-medium text-text-main dark:text-secondary">
                           <i className="fa-solid fa-arrow-up w-4 text-center text-text-light"></i>
                           <span>Prix du "Bump" (MAD)</span>
                        </label>
                        <div className="flex items-center space-x-4 mt-1">
                            <input type="number" id="bumpPrice" name="bumpPrice" value={currentSettings.bumpPrice} onChange={handleChange} className={inputClasses} step="1" min="0" max="50"/>
                            <input type="range" min="0" max="50" step="1" name="bumpPrice" value={currentSettings.bumpPrice} onChange={handleChange} className={sliderClasses} />
                        </div>
                         <p className="mt-2 text-xs text-text-light dark:text-gray-400">Le coût pour remonter un article en tête de liste.</p>
                    </div>
                     <div>
                        <label htmlFor="featurePrice" className="flex items-center space-x-2 text-sm font-medium text-text-main dark:text-secondary">
                            <i className="fa-solid fa-star w-4 text-center text-text-light"></i>
                           <span>Prix de la "Mise à la une" (MAD)</span>
                        </label>
                        <div className="flex items-center space-x-4 mt-1">
                            <input type="number" id="featurePrice" name="featurePrice" value={currentSettings.featurePrice} onChange={handleChange} className={inputClasses} step="5" min="0" max="200" />
                            <input type="range" min="0" max="200" step="5" name="featurePrice" value={currentSettings.featurePrice} onChange={handleChange} className={sliderClasses} />
                        </div>
                        <p className="mt-2 text-xs text-text-light dark:text-gray-400">Le coût pour mettre un article en avant pendant 7 jours.</p>
                    </div>
                </CardContent>
            </Card>

            {/* Pro Seller Settings Card */}
             <Card>
                <CardHeader>
                    <CardTitle>Paramètres Vendeur Pro</CardTitle>
                    <CardDescription>Gérez les avantages et le coût de l'abonnement Pro.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <label htmlFor="proSubscriptionPrice" className="flex items-center space-x-2 text-sm font-medium text-text-main dark:text-secondary">
                            <i className="fa-solid fa-crown w-4 text-center text-text-light"></i>
                           <span>Abonnement Pro (MAD/mois)</span>
                        </label>
                         <div className="flex items-center space-x-4 mt-1">
                            <input type="number" id="proSubscriptionPrice" name="proSubscriptionPrice" value={currentSettings.proSubscriptionPrice} onChange={handleChange} className={inputClasses} step="1" min="0" max="300" />
                            <input type="range" min="0" max="300" step="1" name="proSubscriptionPrice" value={currentSettings.proSubscriptionPrice} onChange={handleChange} className={sliderClasses} />
                        </div>
                        <p className="mt-2 text-xs text-text-light dark:text-gray-400">Le prix mensuel pour l'abonnement Vendeur Pro.</p>
                    </div>
                     <div>
                        <label htmlFor="proCommission" className="flex items-center space-x-2 text-sm font-medium text-text-main dark:text-secondary">
                             <i className="fa-solid fa-percent w-4 text-center text-text-light"></i>
                            <span>Commission Vendeur Pro (%)</span>
                        </label>
                        <div className="flex items-center space-x-4 mt-1">
                            <input type="number" id="proCommission" name="proCommission" value={currentSettings.proCommission} onChange={handleChange} className={inputClasses} step="0.5" min="0" max="10" />
                            <input type="range" min="0" max="10" step="0.5" name="proCommission" value={currentSettings.proCommission} onChange={handleChange} className={sliderClasses} />
                        </div>
                         <p className="mt-2 text-xs text-text-light dark:text-gray-400">Le pourcentage réduit prélevé sur les ventes des Vendeurs Pro.</p>
                    </div>
                </CardContent>
             </Card>
             
             {/* Action Footer */}
             <div className="lg:col-span-2">
                 <Card>
                    <CardFooter className="justify-end space-x-3">
                        <Button onClick={handleReset} variant="ghost" className="h-10 px-6" disabled={!isDirty}>
                            Réinitialiser
                        </Button>
                         <Button onClick={handleSave} className="h-10 px-6" disabled={!isDirty}>
                            <i className="fa-solid fa-save mr-2"></i>
                            Enregistrer les modifications
                        </Button>
                    </CardFooter>
                 </Card>
             </div>
        </div>
    );
};

export default AdminSettings;
