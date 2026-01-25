import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '../ui/Card';
import Button from '../ui/Button';
import type { AppContent } from '../../App';

interface AdminContentProps {
    showToast: (message: string, icon: string) => void;
    onContentUpdate: (newContent: AppContent) => void;
    appContent: AppContent;
}

const initialLegalText = `Mentions Légales de BALAoui

1. Informations sur l'éditeur
Le site BALAoui est édité par la société [Nom de la société], [Forme juridique] au capital de [Montant], immatriculée au Registre du Commerce et des Sociétés de [Ville] sous le numéro [Numéro RCS], dont le siège social est situé au [Adresse].

2. Hébergement
Le site est hébergé par [Nom de l'hébergeur], [Adresse de l'hébergeur], [Contact de l'hébergeur].

3. Propriété Intellectuelle
L'ensemble des éléments constituant ce site (textes, graphismes, logos, etc.) sont la propriété exclusive de [Nom de la société] ou de ses partenaires et sont protégés par les lois marocaines et internationales relatives à la propriété intellectuelle.

4. Données Personnelles
Conformément à la loi n° 09-08, vous disposez d'un droit d'accès, de rectification et d'opposition aux données personnelles vous concernant.`;

const AdminContent: React.FC<AdminContentProps> = ({ showToast, onContentUpdate, appContent }) => {
    const [legalText, setLegalText] = useState(initialLegalText);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [heroPreview, setHeroPreview] = useState<string | null>(null);
    const [slogan, setSlogan] = useState(appContent.heroSlogan || '');
    const [subSlogan, setSubSlogan] = useState(appContent.heroSubSlogan || '');


    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'hero') => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (type === 'logo') {
                    setLogoPreview(reader.result as string);
                } else {
                    setHeroPreview(reader.result as string);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        const newContent: AppContent = {
            heroSlogan: slogan,
            heroSubSlogan: subSlogan,
        };
        if (logoPreview) newContent.logoUrl = logoPreview;
        if (heroPreview) newContent.heroImageUrl = heroPreview;
        
        onContentUpdate(newContent);
        
        // In a real application, this would also save the legal text to a database.
        console.log("Saving legal text:", legalText);

        showToast('Contenu mis à jour avec succès !', 'fa-solid fa-save');
        setLogoPreview(null);
        setHeroPreview(null);
    };
    
    const inputClasses = "mt-1 block w-full px-3 py-2 bg-inherit border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary";
    const textareaClasses = `${inputClasses} min-h-[300px] text-sm leading-relaxed`;

    return (
        <div className="max-w-3xl">
            <Card>
                <CardHeader>
                    <CardTitle>Gestion du Contenu</CardTitle>
                    <CardDescription>Modifiez l'apparence et les textes des pages légales de la plateforme.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    {/* Visuals Section */}
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-text-main dark:text-secondary">Logo du site</label>
                            {logoPreview && <img src={logoPreview} alt="Aperçu du logo" className="mt-2 h-12 bg-gray-100 dark:bg-gray-700 p-2 rounded-md" />}
                            <input type="file" accept="image/png, image/jpeg, image/svg+xml" onChange={(e) => handleFileChange(e, 'logo')} className="mt-2 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
                            <p className="mt-1 text-xs text-text-light dark:text-gray-400">Recommandé: PNG transparent, hauteur de 40px.</p>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-text-main dark:text-secondary">Image de la page d'accueil (Hero)</label>
                            {heroPreview && <img src={heroPreview} alt="Aperçu de l'image" className="mt-2 h-32 w-full object-cover rounded-md" />}
                            <input type="file" accept="image/png, image/jpeg" onChange={(e) => handleFileChange(e, 'hero')} className="mt-2 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
                            <p className="mt-1 text-xs text-text-light dark:text-gray-400">Recommandé: 1200x800px.</p>
                        </div>
                        <div>
                            <label htmlFor="slogan" className="block text-sm font-medium text-text-main dark:text-secondary">Slogan principal</label>
                            <input 
                                type="text" 
                                id="slogan"
                                value={slogan}
                                onChange={(e) => setSlogan(e.target.value)}
                                className={inputClasses}
                                placeholder="ex: BALAoui. Trouvez. Partagez."
                            />
                        </div>
                        <div>
                            <label htmlFor="subSlogan" className="block text-sm font-medium text-text-main dark:text-secondary">Slogan secondaire</label>
                            <textarea
                                id="subSlogan"
                                value={subSlogan}
                                onChange={(e) => setSubSlogan(e.target.value)}
                                rows={2}
                                className={inputClasses}
                                placeholder="ex: Votre nouvelle destination pour la seconde main..."
                            />
                        </div>
                    </div>
                    {/* Legal Text Section */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
                        <label htmlFor="legalText" className="block text-sm font-medium text-text-main dark:text-secondary">Informations Légales</label>
                        <textarea
                            id="legalText"
                            value={legalText}
                            onChange={(e) => setLegalText(e.target.value)}
                            className={textareaClasses}
                        />
                        <p className="mt-2 text-xs text-text-light dark:text-gray-400">Ce texte apparaîtra sur la page "Mentions Légales" du site.</p>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleSave} className="h-10 px-6">
                        <i className="fa-solid fa-save mr-2"></i>
                        Enregistrer les modifications
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};

export default AdminContent;