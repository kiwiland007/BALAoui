
import React, { useState, useEffect, useRef } from 'react';
import type { User, View, Product } from '../types';
import type { Theme } from '../App';
import Button from './ui/Button';

interface HeaderProps {
  onNavigate: (view: View) => void;
  user: User | null;
  onLogout: () => void;
  theme: Theme;
  toggleTheme: () => void;
  savedItemsCount: number;
  allProducts: Product[];
  logoUrl?: string;
}

const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
};

const Header: React.FC<HeaderProps> = ({ onNavigate, user, onLogout, theme, toggleTheme, savedItemsCount, allProducts, logoUrl }) => {
  const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearchFocused, setSearchFocused] = useState(false);
  
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    if (debouncedSearchQuery) {
        const filtered = allProducts.filter(p => 
            p.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
            p.description.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
        ).slice(0, 5); // Limit to 5 results for dropdown
        setSearchResults(filtered);
    } else {
        setSearchResults([]);
    }
  }, [debouncedSearchQuery, allProducts]);

  const handleSearchSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if(searchQuery.trim()){
          setSearchQuery('');
          setSearchFocused(false);
          onNavigate({ name: 'search', query: searchQuery });
      }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-sm dark:border-b dark:border-gray-800 z-50">
      <div className="container mx-auto px-4 py-1 flex justify-between items-center">
        <div 
          className="flex items-center cursor-pointer transition-transform duration-200 hover:scale-105"
          onClick={() => onNavigate({ name: 'home' })}
        >
          {logoUrl ? (
            <img src={logoUrl} alt="BALAoui Logo" className="h-24 w-24 object-contain" />
          ) : (
            <>
              <i className="fa-solid fa-tags text-primary text-4xl -rotate-90 mr-2"></i>
               <h1 className="text-4xl font-bold text-primary">
                BALAoui
              </h1>
            </>
          )}
        </div>
        
        {user && <div className="hidden md:flex flex-1 max-w-xl mx-4" ref={searchRef}>
          <form className="relative w-full" onSubmit={handleSearchSubmit}>
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-light dark:text-gray-400">
              <i className="fa fa-search"></i>
            </span>
            <input
              type="text"
              placeholder="Rechercher des articles..."
              className="w-full bg-gray-100 dark:bg-gray-800 border-transparent text-text-main dark:text-secondary rounded-lg py-2.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
            />
             {isSearchFocused && searchResults.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 overflow-hidden animate-slide-down">
                    <ul>
                        {searchResults.map(product => (
                            <li key={product.id} onClick={() => { onNavigate({ name: 'productDetail', product }); setSearchQuery(''); setSearchFocused(false);}} className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center space-x-4">
                                <img src={product.images[0]} alt={product.title} className="w-12 h-12 object-cover rounded-md" />
                                <div>
                                    <p className="font-semibold text-sm text-text-main dark:text-secondary">{product.title}</p>
                                    <p className="text-sm text-primary dark:text-teal-400">{product.price} MAD</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                     <button onClick={handleSearchSubmit} className="w-full p-3 bg-gray-50 dark:bg-gray-900 text-center text-sm font-semibold text-primary hover:bg-gray-100 dark:hover:bg-gray-700">
                        Voir tous les résultats
                    </button>
                </div>
            )}
          </form>
        </div>}

        <div className="flex items-center space-x-2 md:space-x-4">
          {user ? (
            <>
                <Button 
                    className="hidden sm:flex items-center text-white font-bold px-6 py-3 rounded-lg bg-gradient-to-r from-primary to-accent shadow-lg hover:shadow-xl transition-all duration-300 h-11 animate-pulse-glow"
                    onClick={() => onNavigate({ name: 'addItem' })}
                >
                    <i className="fa-solid fa-plus-circle mr-2"></i>
                    Vendre un article
                </Button>
                 <button
                    onClick={() => onNavigate({ name: 'chat' })}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-text-light dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    aria-label="Voir les messages"
                >
                    <i className="fa-regular fa-comments text-xl"></i>
                </button>
                <button
                    onClick={() => onNavigate({ name: 'saved' })}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-text-light dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
                    aria-label="Voir les articles sauvegardés"
                >
                    <i className="fa-regular fa-heart text-xl"></i>
                    {savedItemsCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {savedItemsCount}
                    </span>
                    )}
                </button>
                <button 
                    onClick={toggleTheme}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-text-light dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    aria-label="Toggle theme"
                    >
                    {theme === 'light' ? 
                    <i className="fa-solid fa-moon text-lg"></i> : 
                    <i className="fa-solid fa-sun text-lg"></i>
                    }
                </button>
                <div className="relative" ref={profileMenuRef}>
                    <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-10 h-10 rounded-full cursor-pointer border-2 border-transparent hover:border-primary transition"
                    onClick={() => setProfileMenuOpen(prev => !prev)}
                    />
                    {isProfileMenuOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 overflow-hidden animate-slide-down">
                            <div className="p-3 border-b dark:border-gray-700">
                                <p className="text-sm font-semibold text-text-main dark:text-secondary">Bonjour, {user.name} !</p>
                                <p className="text-sm text-text-light dark:text-gray-400">Solde: <span className="font-bold text-primary">{user.balance.toFixed(2)} MAD</span></p>
                            </div>
                            <ul className="py-2">
                                {user.isAdmin && <li onClick={() => { onNavigate({ name: 'admin' }); setProfileMenuOpen(false);}} className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-text-main dark:text-secondary flex items-center space-x-3"><i className="fa-solid fa-shield-halved w-4"></i><span>Admin</span></li>}
                                <li onClick={() => { onNavigate({ name: 'profile', user }); setProfileMenuOpen(false);}} className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-text-main dark:text-secondary flex items-center space-x-3"><i className="fa-regular fa-user w-4"></i><span>Mon Profil</span></li>
                                <li onClick={() => { onNavigate({ name: 'chat' }); setProfileMenuOpen(false);}} className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-text-main dark:text-secondary flex items-center space-x-3"><i className="fa-regular fa-comments w-4"></i><span>Mes Messages</span></li>
                                <li onClick={() => { onNavigate({ name: 'saved' }); setProfileMenuOpen(false);}} className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-text-main dark:text-secondary flex items-center space-x-3"><i className="fa-regular fa-heart w-4"></i><span>Mes Favoris</span></li>
                            </ul>
                            <div className="p-2 border-t dark:border-gray-700">
                                <button onClick={onLogout} className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-text-light dark:text-gray-400 flex items-center space-x-3 text-sm"><i className="fa-solid fa-arrow-right-from-bracket w-4"></i><span>Déconnexion</span></button>
                            </div>
                        </div>
                    )}
                </div>
            </>
          ) : (
             <>
                <Button variant="ghost" className="h-10 px-4" onClick={() => onNavigate({ name: 'auth' })}>Se connecter</Button>
                <Button variant="outline" className="h-10 px-4 border-accent text-accent hover:bg-accent/10 hover:text-accent" onClick={() => onNavigate({ name: 'auth' })}>S'abonner</Button>
                <Button className="h-10 px-4" onClick={() => onNavigate({ name: 'auth' })}>S'inscrire</Button>
             </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
