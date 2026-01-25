
import React, { useState, useCallback, useEffect } from 'react';
import type { Product, User, View, Transaction, Conversation, Message } from './types';
import { ProductStatus, TransactionType, TransactionStatus } from './types';
import api from './lib/api';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import ProductDetailPage from './pages/ProductDetailPage';
import AddItemPage from './pages/AddItemPage';
import EditItemPage from './pages/EditItemPage';
import ProfilePage from './pages/ProfilePage';
import SavedItemsPage from './pages/SavedItemsPage';
import SearchResultsPage from './pages/SearchResultsPage';
import AdminPage from './pages/AdminPage';
import ChatPage from './pages/ChatPage';
import Toast from './components/Toast';
import SkeletonCard from './components/SkeletonCard';
import ReportModal from './components/ReportModal';
import AddBalanceModal from './components/AddBalanceModal';
import ProModal from './components/ProModal';
import AuthPage from './pages/AuthPage';

export type Theme = 'light' | 'dark';
export type ToastMessage = { id: number; message: string; icon: string; } | null;
export interface AppSettings {
  commission: number;
  bumpPrice: number;
  featurePrice: number;
  proSubscriptionPrice: number;
  proCommission: number;
}
export interface AppContent {
  logoUrl?: string;
  heroImageUrl?: string;
  heroSlogan?: string;
  heroSubSlogan?: string;
}

const App: React.FC = () => {
  const [view, setView] = useState<View>({ name: 'home' });
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [savedItems, setSavedItems] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<ToastMessage>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [productToReport, setProductToReport] = useState<Product | null>(null);
  const [isAddingBalance, setIsAddingBalance] = useState(false);
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [appSettings, setAppSettings] = useState<AppSettings>({
      commission: 5, // 5%
      bumpPrice: 10, // 10 MAD
      featurePrice: 50, // 50 MAD
      proSubscriptionPrice: 99, // 99 MAD/month
      proCommission: 2, // 2% for Pro sellers
  });
   const [appContent, setAppContent] = useState<AppContent>({
    logoUrl: 'https://i.ibb.co/9vM9yBv/logo-no-background.png',
    heroImageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=2070&auto=format&fit=crop',
    heroSlogan: 'BALAoui. Trouvez. Partagez.',
    heroSubSlogan: 'La marketplace C2C nouvelle génération au Maroc. Achetez et vendez des articles de seconde main en toute confiance.',
  });
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        return 'dark';
      }
    }
    return 'light';
  });

  const toggleTheme = () => {
    setTheme(prevTheme => {
        const newTheme = prevTheme === 'light' ? 'dark' : 'light';
        if (typeof window !== 'undefined') {
            localStorage.setItem('theme', newTheme);
            if (newTheme === 'dark') {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        }
        return newTheme;
    });
  };

  useEffect(() => {
    Promise.all([
      api.getProducts(),
      api.getUsers(),
      api.getTransactions(),
    ]).then(([fetchedProducts, fetchedUsers, fetchedTransactions]) => {
      setProducts(fetchedProducts);
      setUsers(fetchedUsers);
      setTransactions(fetchedTransactions);
      setIsLoading(false);
    });
  }, []);

  const showToast = (message: string, icon: string) => {
    const id = Date.now();
    setToast({ id, message, icon });
    setTimeout(() => {
      setToast(prev => (prev && prev.id === id ? null : prev));
    }, 3000);
  };
  
  const handleNavigate = useCallback((newView: View) => {
    setView(newView);
    window.scrollTo(0, 0);
  }, []);

  const handleToggleSave = useCallback((productId: string) => {
    setSavedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
        showToast("Article retiré des favoris", "fa-solid fa-heart-crack");
      } else {
        newSet.add(productId);
        showToast("Article ajouté aux favoris!", "fa-solid fa-heart");
      }
      return newSet;
    });
  }, []);
  
  const handleAddItem = useCallback((newProductData: Omit<Product, 'id' | 'seller' | 'status'>) => {
    if (!currentUser) {
      showToast("Vous devez être connecté pour vendre un article.", "fa-solid fa-warning");
      return;
    }
    const newProduct: Product = {
      ...newProductData,
      id: `p${Date.now()}`,
      seller: currentUser,
      status: ProductStatus.Pending,
    };
    setProducts(prev => [newProduct, ...prev]);
    showToast("Votre article a été soumis pour approbation !", "fa-solid fa-check-circle");
    handleNavigate({ name: 'profile', user: currentUser });
  }, [currentUser, handleNavigate]);
  
  const handleUpdateItem = useCallback((updatedProduct: Product) => {
      setProducts(prevProducts =>
          prevProducts.map(p => (p.id === updatedProduct.id ? updatedProduct : p))
      );
      showToast("Article mis à jour avec succès !", "fa-solid fa-check-circle");
      if (currentUser) {
          handleNavigate({ name: 'profile', user: currentUser });
      } else {
          handleNavigate({ name: 'home' });
      }
  }, [currentUser, handleNavigate]);

  const handlePurchase = useCallback((product: Product) => {
      if(!currentUser) {
          showToast("Veuillez vous connecter pour acheter.", "fa-solid fa-info-circle");
          handleNavigate({ name: 'auth' });
          return;
      }
      showToast(`Votre demande d'achat pour "${product.title}" a été envoyée !`, "fa-solid fa-paper-plane");
  }, [currentUser, handleNavigate]);

  const handleReportSubmit = useCallback((productId: string, reason: string, details: string) => {
      console.log(`Reported product ${productId} for reason: ${reason}. Details: ${details}`);
      setProductToReport(null);
      showToast('Merci, votre signalement a été envoyé.', 'fa-solid fa-check-circle');
  }, []);

  const handleUpdateSettings = useCallback((newSettings: AppSettings) => {
      setAppSettings(newSettings);
      showToast('Paramètres mis à jour avec succès !', 'fa-solid fa-save');
  }, []);
  
  const handleProductStatusChange = useCallback((productId: string, status: ProductStatus) => {
    setProducts(prev => prev.map(p => p.id === productId ? {...p, status} : p));
    showToast(`Article ${status === ProductStatus.Approved ? 'approuvé' : 'rejeté'}.`, 'fa-solid fa-check-circle');
  }, []);
  
  const handleContentUpdate = useCallback((newContent: AppContent) => {
      setAppContent(prev => ({...prev, ...newContent}));
  }, []);

  const handleAddBalance = useCallback((amount: number) => {
    if(!currentUser) return;
    setCurrentUser(prevUser => {
        if (!prevUser) return null;
        const newBalance = prevUser.balance + amount;
        
        setUsers(prevUsers => prevUsers.map(u => u.id === prevUser.id ? {...u, balance: newBalance} : u));
        
        return { ...prevUser, balance: newBalance };
    });
    setIsAddingBalance(false);
    showToast(`${amount} MAD ont été ajoutés à votre solde.`, "fa-solid fa-circle-check");
  }, [currentUser]);

  const handleBoostProduct = useCallback((productId: string, option: 'bump' | 'feature', paymentMethod: 'card' | 'balance') => {
      if(!currentUser) return;

      const cost = option === 'bump' ? appSettings.bumpPrice : appSettings.featurePrice;
      
      const proceedWithBoost = () => {
        setProducts(prevProducts => prevProducts.map(p => {
            if (p.id === productId) {
                if (option === 'bump') {
                    return { ...p, boostedUntil: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString() };
                } else {
                    return { ...p, isFeatured: true };
                }
            }
            return p;
        }));
        showToast(`Votre article a été promu avec succès !`, 'fa-solid fa-rocket');
      }
      
      if (paymentMethod === 'balance') {
          if (currentUser.balance < cost) {
              showToast('Solde insuffisant.', 'fa-solid fa-warning');
              return;
          }
          setCurrentUser(prev => prev ? {...prev, balance: prev.balance - cost} : null);
          setUsers(prev => prev.map(u => u.id === currentUser.id ? {...u, balance: u.balance - cost} : u));
          proceedWithBoost();
      } else { // 'card'
          showToast('Paiement par carte réussi.', 'fa-solid fa-credit-card');
          proceedWithBoost();
      }
  }, [currentUser, appSettings]);
  
  const handleDeleteProduct = useCallback((productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    showToast('Article supprimé avec succès.', 'fa-solid fa-trash-can');
  }, []);

  const handleSubscribePro = useCallback(() => {
      if(!currentUser) return;
      const cost = appSettings.proSubscriptionPrice;
      if (currentUser.balance < cost) {
          showToast('Solde insuffisant pour souscrire.', 'fa-solid fa-warning');
          return;
      }

      const newExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      const updatedUser = {
          ...currentUser, 
          balance: currentUser.balance - cost,
          isPro: true,
          proSubscriptionExpires: newExpiry
      };

      setCurrentUser(updatedUser);
      setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
      setIsProModalOpen(false);
      showToast('Félicitations, vous êtes maintenant Vendeur Pro !', 'fa-solid fa-crown');

  }, [currentUser, appSettings.proSubscriptionPrice]);

  const handleToggleUserProStatus = useCallback((userId: string) => {
      setUsers(prevUsers => prevUsers.map(user => {
          if (user.id === userId) {
              const isNowPro = !user.isPro;
              showToast(`${user.name} est maintenant un vendeur ${isNowPro ? 'Pro' : 'Standard'}.`, 'fa-solid fa-user-check');
              return {
                  ...user,
                  isPro: isNowPro,
                  proSubscriptionExpires: isNowPro ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : undefined,
              };
          }
          return user;
      }));
  }, []);

   const handleLogin = (user: User) => {
    setCurrentUser(user);
    handleNavigate({ name: 'home' });
    showToast(`Bienvenue, ${user.name} !`, "fa-solid fa-hand-sparkles");
  };

  const handleLogout = () => {
    setCurrentUser(null);
    handleNavigate({ name: 'home' });
    showToast("Vous avez été déconnecté.", "fa-solid fa-arrow-right-from-bracket");
  };
  
  const fetchConversations = useCallback(async () => {
    if (currentUser) {
      setIsLoading(true);
      const convs = await api.getConversationsForUser(currentUser.id);
      setConversations(convs);
      setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const handleMessageSeller = useCallback(async (recipient: User, product: Product) => {
    if (!currentUser) {
      handleNavigate({ name: 'auth' });
      showToast('Veuillez vous connecter pour envoyer un message.', 'fa-solid fa-info-circle');
      return;
    }
    const conversation = await api.findOrCreateConversation(currentUser, recipient, product);
    
    await fetchConversations();
    handleNavigate({ name: 'chat', conversationId: conversation.id });

  }, [currentUser, handleNavigate, fetchConversations]);

  const handleSendMessage = useCallback(async (conversationId: string, text: string) => {
    if (!currentUser) return;
    await api.sendMessage(conversationId, text, currentUser.id);
    fetchConversations();
  }, [currentUser, fetchConversations]);


  const renderView = () => {
    if (view.name === 'auth') {
       return <AuthPage onLogin={handleLogin} showToast={showToast} onNavigate={handleNavigate} logoUrl={appContent.logoUrl}/>
    }
    
    const mainContent = (() => {
        if (isLoading && view.name === 'home') {
             return (
                <div className="container mx-auto px-4 py-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                </div>
            );
        }

        switch (view.name) {
          case 'home':
            return <HomePage 
              products={products} 
              onProductSelect={(product) => handleNavigate({ name: 'productDetail', product })} 
              onNavigate={handleNavigate}
              savedItems={savedItems}
              onToggleSave={handleToggleSave}
              currentUser={currentUser}
              onReportProduct={setProductToReport}
              heroImageUrl={appContent.heroImageUrl || ''}
              heroSlogan={appContent.heroSlogan || ''}
              heroSubSlogan={appContent.heroSubSlogan || ''}
            />;
          case 'productDetail':
            return <ProductDetailPage 
                product={view.product} 
                allProducts={products}
                onBack={() => handleNavigate({ name: 'home' })} 
                onSellerClick={(user) => handleNavigate({ name: 'profile', user })}
                onProductSelect={(product) => handleNavigate({ name: 'productDetail', product })}
                savedItems={savedItems}
                onToggleSave={handleToggleSave}
                onPurchase={handlePurchase}
                currentUser={currentUser}
                onReportProduct={setProductToReport}
                onMessageSeller={handleMessageSeller}
                showToast={showToast}
            />;
          case 'addItem':
            return <AddItemPage onAddItem={handleAddItem} onCancel={() => handleNavigate({name: 'home'})} />;
          case 'editItem':
            return <EditItemPage 
                product={view.product} 
                onUpdateItem={handleUpdateItem} 
                onCancel={() => currentUser ? handleNavigate({name: 'profile', user: currentUser}) : handleNavigate({name: 'home'})}
            />;
          case 'profile':
            return <ProfilePage 
                user={view.user} 
                allProducts={products}
                onProductSelect={(product) => handleNavigate({ name: 'productDetail', product })}
                onBoostProduct={handleBoostProduct}
                onDeleteProduct={handleDeleteProduct}
                onEditProduct={(product) => handleNavigate({ name: 'editItem', product })}
                savedItems={savedItems}
                onToggleSave={handleToggleSave}
                appSettings={appSettings}
                currentUser={currentUser}
                onReportProduct={setProductToReport}
                onOpenAddBalance={() => setIsAddingBalance(true)}
                onOpenProModal={() => setIsProModalOpen(true)}
            />;
          case 'saved':
            return <SavedItemsPage 
                products={products}
                savedItems={savedItems}
                onProductSelect={(product) => handleNavigate({ name: 'productDetail', product })}
                onToggleSave={handleToggleSave}
                onNavigate={handleNavigate}
                currentUser={currentUser}
                onReportProduct={setProductToReport}
            />;
          case 'search':
            return <SearchResultsPage 
                query={view.query}
                allProducts={products}
                onProductSelect={(product) => handleNavigate({ name: 'productDetail', product })}
                savedItems={savedItems}
                onToggleSave={handleToggleSave}
                currentUser={currentUser}
                onReportProduct={setProductToReport}
            />;
          case 'admin':
            return <AdminPage 
                onNavigate={handleNavigate}
                appSettings={appSettings}
                appContent={appContent}
                onUpdateSettings={handleUpdateSettings}
                products={products}
                users={users}
                transactions={transactions}
                onProductStatusChange={handleProductStatusChange}
                showToast={showToast}
                onContentUpdate={handleContentUpdate}
                onToggleUserProStatus={handleToggleUserProStatus}
            />
          case 'chat':
            if (!currentUser) {
              return <AuthPage onLogin={handleLogin} showToast={showToast} onNavigate={handleNavigate} logoUrl={appContent.logoUrl} />;
            }
            return <ChatPage 
              currentUser={currentUser} 
              conversations={conversations} 
              onNavigate={handleNavigate}
              onSendMessage={handleSendMessage}
              initialConversationId={view.conversationId}
              isConversationsLoading={isLoading}
            />;
          default:
            return <div>Page not found</div>;
        }
    })();
    
    return (
        <div className="min-h-screen bg-secondary dark:bg-slate-900 font-sans">
            <Header 
              onNavigate={handleNavigate} 
              user={currentUser} 
              onLogout={handleLogout}
              theme={theme}
              toggleTheme={toggleTheme}
              savedItemsCount={savedItems.size}
              allProducts={products}
              logoUrl={appContent.logoUrl}
            />
            <main className="pt-28">
              {mainContent}
            </main>
            {toast && <Toast key={toast.id} message={toast.message} icon={toast.icon} />}
            {productToReport && <ReportModal product={productToReport} onClose={() => setProductToReport(null)} onSubmit={handleReportSubmit} />}
            {isAddingBalance && currentUser && <AddBalanceModal onClose={() => setIsAddingBalance(false)} onAddBalance={handleAddBalance} />}
            {isProModalOpen && currentUser && <ProModal onClose={() => setIsProModalOpen(false)} onSubscribe={handleSubscribePro} settings={appSettings} currentUser={currentUser} />}
        </div>
    );
  };
  
  return renderView();
};

export default App;
