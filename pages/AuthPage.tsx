
import React, { useState } from 'react';
import type { User, View } from '../types';
import Button from '../components/ui/Button';
import { Card, CardContent, CardFooter, CardHeader } from '../components/ui/Card';
import api from '../lib/api';

interface AuthPageProps {
    onLogin: (user: User) => void;
    showToast: (message: string, icon: string) => void;
    onNavigate: (view: View) => void;
    logoUrl?: string;
}

type AuthMode = 'login' | 'signup';

const AuthPage: React.FC<AuthPageProps> = ({ onLogin, showToast, onNavigate, logoUrl }) => {
    const [mode, setMode] = useState<AuthMode>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            let user;
            if (mode === 'login') {
                user = await api.login(email, password);
                onLogin(user);
            } else {
                user = await api.signup(name, email, password);
                onLogin(user);
            }
        } catch (error) {
            if (error instanceof Error) {
                showToast(error.message, 'fa-solid fa-circle-exclamation');
            } else {
                showToast('Une erreur est survenue.', 'fa-solid fa-circle-exclamation');
            }
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSocialLogin = async (provider: 'google' | 'facebook') => {
        try {
            const user = provider === 'google' ? await api.loginWithGoogle() : await api.loginWithFacebook();
            onLogin(user);
        } catch (error) {
            if (error instanceof Error) {
                showToast(error.message, 'fa-solid fa-circle-exclamation');
            }
        }
    }
    
    const inputClasses = "w-full px-3 py-2 bg-inherit border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary";

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
            <div className="flex items-center mb-6 cursor-pointer" onClick={() => onNavigate({ name: 'home' })}>
                {logoUrl ? (
                    <img src={logoUrl} alt="BALAoui Logo" className="h-28 w-28 object-contain" />
                ) : (
                    <h1 className="text-4xl font-bold text-primary">BALAoui</h1>
                )}
            </div>
            <Card className="w-full max-w-md">
                <CardHeader className="p-6">
                    <div className="flex border-b border-gray-200 dark:border-gray-700">
                        <button onClick={() => setMode('login')} className={`flex-1 pb-3 font-semibold text-center ${mode === 'login' ? 'text-primary border-b-2 border-primary' : 'text-text-light'}`}>
                            Se connecter
                        </button>
                        <button onClick={() => setMode('signup')} className={`flex-1 pb-3 font-semibold text-center ${mode === 'signup' ? 'text-primary border-b-2 border-primary' : 'text-text-light'}`}>
                            S'inscrire
                        </button>
                    </div>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="p-6 space-y-4">
                        {mode === 'signup' && (
                             <div>
                                <label htmlFor="name" className="block text-sm font-medium text-text-main dark:text-secondary mb-1">Nom complet</label>
                                <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className={inputClasses} required />
                            </div>
                        )}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-text-main dark:text-secondary mb-1">Email</label>
                            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClasses} required />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-text-main dark:text-secondary mb-1">Mot de passe</label>
                            <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClasses} required />
                        </div>
                    </CardContent>
                    <CardFooter className="p-6 flex flex-col gap-4">
                        <Button type="submit" className="w-full h-11" disabled={isLoading}>
                            {isLoading ? 'Chargement...' : (mode === 'login' ? 'Se connecter' : 'Créer un compte')}
                        </Button>

                        <div className="relative my-2">
                          <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-gray-300 dark:border-gray-600" />
                          </div>
                          <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white dark:bg-gray-800 px-2 text-text-light">
                              Ou continuer avec
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Button type="button" variant="outline" className="w-full h-11" onClick={() => handleSocialLogin('google')}>
                                <i className="fa-brands fa-google mr-2"></i> Google
                            </Button>
                            <Button type="button" variant="outline" className="w-full h-11" onClick={() => handleSocialLogin('facebook')}>
                                <i className="fa-brands fa-facebook-f mr-2"></i> Facebook
                            </Button>
                        </div>
                        
                        <p className="text-xs text-center text-text-light mt-4">
                            En continuant, vous acceptez nos <a href="#" className="underline">Conditions d'utilisation</a> et notre <a href="#" className="underline">Politique de confidentialité</a>.
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
};

export default AuthPage;
