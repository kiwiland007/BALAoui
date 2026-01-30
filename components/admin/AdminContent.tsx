
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '../ui/Card';
import Button from '../ui/Button';
import type { AppContent } from '../../App';
import api from '../../lib/api';

interface AdminContentProps {
    showToast: (message: string, icon: string) => void;
    onContentUpdate: (newContent: AppContent) => void;
    appContent: AppContent;
}

const initialLegalText = `Mentions Légales de BALAoui...`;

const AdminContent: React.FC<AdminContentProps> = ({ showToast, onContentUpdate, appContent }) => {
    const [legalText, setLegalText] = useState(initialLegalText);
    const [logoPreview, setLogoPreview] = useState<string | null>(appContent.logoUrl || null);
    const [heroPreview, setHeroPreview] = useState<string | null>(appContent.heroImageUrl || null);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [heroFile, setHeroFile] = useState<File | null>(null);
    const [slogan, setSlogan] = useState(appContent.heroSlogan || '');
    const [subSlogan, setSubSlogan] = useState(appContent.heroSubSlogan || '');
    const [isSaving, setIsSaving] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'hero') => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            if (type === 'logo') {
                setLogoPreview(url);
                setLogoFile(file);
            } else {
                setHeroPreview(url);
                setHeroFile(file);
            }
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const newContent: AppContent = {
                ...appContent,
                heroSlogan: slogan,
                heroSubSlogan: subSlogan,
            };

            if (logoFile) {
                newContent.logoUrl = await api.uploadImage(logoFile, 'products');
            }
            if (heroFile) {
                newContent.heroImageUrl = await api.uploadImage(heroFile, 'products');
            }

            await api.updateSettings('app_content', newContent);
            onContentUpdate(newContent);

            showToast('Contenu mis à jour !', 'fa-solid fa-save');
            setLogoFile(null);
            setHeroFile(null);
        } catch (err) {
            console.error(err);
            showToast('Erreur lors de la sauvegarde.', 'fa-solid fa-warning');
        } finally {
            setIsSaving(false);
        }
    };

    const inputClasses = "mt-1 block w-full px-3 py-2 bg-inherit border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary";

    return (
        <div className="max-w-3xl animate-fade-in">
            <Card>
                <CardHeader>
                    <CardTitle>Identité Visuelle & Textes</CardTitle>
                    <CardDescription>Configurez le logo, l'image héro et les slogans de votre plateforme.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    <div className="space-y-6">
                        <div className="flex items-start space-x-6">
                            <div className="flex-1">
                                <label className="block text-sm font-semibold text-text-main dark:text-secondary mb-2">Logo du site</label>
                                <div className="mt-1 flex items-center space-x-4">
                                    <div className="h-16 w-16 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center overflow-hidden">
                                        {logoPreview ? <img src={logoPreview} className="max-h-full" alt="Logo preview" /> : <i className="fa-solid fa-image text-gray-300"></i>}
                                    </div>
                                    <input type="file" onChange={(e) => handleFileChange(e, 'logo')} className="text-xs" />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-text-main dark:text-secondary mb-2">Image Hero (Accueil)</label>
                            <div className="relative h-40 w-full rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-200 dark:border-gray-700">
                                {heroPreview ? <img src={heroPreview} className="w-full h-full object-cover" alt="Hero preview" /> : <div className="flex items-center justify-center h-full"><i className="fa-solid fa-mountain-sun text-4xl text-gray-300"></i></div>}
                                <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <label className="cursor-pointer bg-white text-primary px-4 py-2 rounded-lg font-bold text-xs">
                                        Changer l'image
                                        <input type="file" className="hidden" onChange={(e) => handleFileChange(e, 'hero')} />
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-text-main dark:text-secondary mb-1">Slogan Principal</label>
                            <input type="text" value={slogan} onChange={(e) => setSlogan(e.target.value)} className={inputClasses} />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-text-main dark:text-secondary mb-1">Sous-Slogan</label>
                            <textarea value={subSlogan} onChange={(e) => setSubSlogan(e.target.value)} rows={3} className={inputClasses} />
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="bg-gray-50 dark:bg-gray-900/50 p-6">
                    <Button onClick={handleSave} disabled={isSaving} className="h-11 px-8 shadow-lg shadow-primary/20">
                        {isSaving ? <i className="fa-solid fa-spinner fa-spin mr-2"></i> : <i className="fa-solid fa-check-double mr-2"></i>}
                        DÉPLOYER LES MODIFICATIONS
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};

export default AdminContent;