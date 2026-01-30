
import React, { useState, useCallback, useEffect } from 'react';
import type { Product, User, View, Transaction, Conversation, Message, Order } from './types';
import { ProductStatus, TransactionType, TransactionStatus } from './types';
import api from './lib/api';
import { supabase } from './lib/supabase';
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
import OrdersPage from './pages/OrdersPage';
import CartPage from './pages/CartPage';
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
  buyerProtectionFeePercent: number;
  buyerProtectionFeeFixed: number;
  shippingFee: number;
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
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [savedItems, setSavedItems] = useState<Set<string>>(new Set());
  const [cartItems, setCartItems] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<ToastMessage>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [productToReport, setProductToReport] = useState<Product | null>(null);
  const [isAddingBalance, setIsAddingBalance] = useState(false);
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [appSettings, setAppSettings] = useState<AppSettings>({
    commission: 5,
    bumpPrice: 10,
    featurePrice: 50,
    proSubscriptionPrice: 99,
    proCommission: 2,
    buyerProtectionFeePercent: 5,
    buyerProtectionFeeFixed: 5,
    shippingFee: 35,
  });
  const [appContent] = useState<AppContent>({
    logoUrl: 'https://i.ibb.co/9vM9yBv/logo-no-background.png',
    heroImageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=2070&auto=format&fit=crop',
    heroSlogan: 'BALAoui. Trouvez. Partagez.',
    heroSubSlogan: 'La marketplace C2C nouvelle génération au Maroc.',
  });
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        return 'dark';
      }
    }
    return 'light';
  });

  // Sync with Supabase Auth
  useEffect(() => {
    const initAuth = async () => {
      const user = await api.getCurrentUser();
      setCurrentUser(user);

      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
          const user = await api.getCurrentUser();
          setCurrentUser(user);
        } else if (event === 'SIGNED_OUT') {
          setCurrentUser(null);
        }
      });

      return () => subscription.unsubscribe();
    };
    initAuth();
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const [p, u, o] = await Promise.all([
        api.getProducts(),
        api.getUsers(),
        api.getOrders(),
      ]);
      setProducts(p);
      setUsers(u);
      setOrders(o);
    } catch (err) {
      console.error("Data fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Real-time Messages Subscription
  useEffect(() => {
    if (!currentUser) return;

    const channel = supabase
      .channel('realtime_messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const newMessage = payload.new;
        setConversations(prev => prev.map(c => {
          if (c.id === newMessage.conversation_id) {
            // Only add if not already there (prevents double messages)
            if (!c.messages.some(m => m.id === newMessage.id)) {
              return {
                ...c,
                messages: [...c.messages, {
                  id: newMessage.id,
                  senderId: newMessage.sender_id,
                  text: newMessage.text,
                  timestamp: newMessage.timestamp
                }],
                lastMessageTimestamp: newMessage.timestamp
              };
            }
          }
          return c;
        }));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser]);

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
        showToast("Retiré des favoris", "fa-solid fa-heart-crack");
      } else {
        newSet.add(productId);
        showToast("Ajouté aux favoris!", "fa-solid fa-heart");
      }
      return newSet;
    });
  }, []);

  const handleAddToCart = useCallback((productId: string) => {
    if (!currentUser) {
      handleNavigate({ name: 'auth' });
      return;
    }
    const product = products.find(p => p.id === productId);
    if (!product || product.status === ProductStatus.Sold || product.seller.id === currentUser.id) {
      showToast("Action impossible.", "fa-solid fa-warning");
      return;
    }
    setCartItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        showToast("Déjà au panier.", "fa-solid fa-info-circle");
      } else {
        newSet.add(productId);
        showToast("Ajouté au panier!", "fa-solid fa-cart-plus");
      }
      return newSet;
    });
  }, [currentUser, products, handleNavigate]);

  const handleRemoveFromCart = useCallback((productId: string) => {
    setCartItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(productId);
      return newSet;
    });
  }, []);

  const handleAddItem = useCallback(async (newProductData: Omit<Product, 'id' | 'seller' | 'status'>, files: File[]) => {
    if (!currentUser) return;

    try {
      // 1. Upload images
      const imageUrls = await Promise.all(
        files.map(file => api.uploadImage(file, currentUser.id))
      );

      // 2. Create product
      const finalProductData = {
        ...newProductData,
        images: imageUrls
      };

      const newProduct = await api.addProduct(finalProductData, currentUser.id);

      setProducts(prev => [newProduct, ...prev]);
      showToast("Article publié !", "fa-solid fa-check-circle");
      handleNavigate({ name: 'profile', user: currentUser });
    } catch (err) {
      console.error(err);
      showToast("Erreur lors de l'ajout.", "fa-solid fa-exclamation-circle");
    }
  }, [currentUser, handleNavigate]);

  const handleUpdateItem = useCallback(async (updatedProduct: Product) => {
    try {
      const result = await api.updateProduct(updatedProduct);
      setProducts(prev => prev.map(p => p.id === result.id ? result : p));
      showToast("Mis à jour !", "fa-solid fa-check-circle");
      if (currentUser) handleNavigate({ name: 'profile', user: currentUser });
    } catch (err) {
      showToast("Erreur de mise à jour.", "fa-solid fa-warning");
    }
  }, [currentUser, handleNavigate]);

  const handleCreateOrder = useCallback(async (product: Product, buyerProtectionFee: number, shippingFee: number, totalAmount: number) => {
    if (!currentUser) {
      handleNavigate({ name: 'auth' });
      return;
    }

    try {
      const newOrder = await api.createOrder(product, currentUser, buyerProtectionFee, shippingFee, totalAmount);
      setOrders(prev => [newOrder, ...prev]);
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, status: ProductStatus.Sold } : p));
      showToast(`Commande passée !`, "fa-solid fa-check-circle");
      handleNavigate({ name: 'orders' });
    } catch (err) {
      showToast("Erreur lors du paiement.", "fa-solid fa-warning");
    }
  }, [currentUser, handleNavigate]);

  const handleAddBalance = useCallback(async (amount: number) => {
    if (!currentUser) return;
    try {
      const updatedUser = await api.updateProfile(currentUser.id, { balance: currentUser.balance + amount });
      setCurrentUser(updatedUser);
      setIsAddingBalance(false);
      showToast(`${amount} MAD ajoutés.`, "fa-solid fa-circle-check");
    } catch (err) {
      showToast("Erreur.", "fa-solid fa-warning");
    }
  }, [currentUser]);

  const handleBoostProduct = useCallback(async (productId: string, option: 'bump' | 'feature', paymentMethod: 'card' | 'balance') => {
    if (!currentUser) return;
    const cost = option === 'bump' ? appSettings.bumpPrice : appSettings.featurePrice;

    try {
      if (paymentMethod === 'balance') {
        if (currentUser.balance < cost) {
          showToast('Solde insuffisant.', 'fa-solid fa-warning');
          return;
        }
        await api.updateProfile(currentUser.id, { balance: currentUser.balance - cost });
        const updatedUser = await api.getCurrentUser();
        setCurrentUser(updatedUser);
      }

      const boostedUntil = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      // Update product locally and remotely
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, boostedUntil, isFeatured: option === 'feature' } : p));

      showToast(`Boost activé !`, 'fa-solid fa-rocket');
    } catch (err) {
      showToast("Erreur lors du boost.", "fa-solid fa-warning");
    }
  }, [currentUser, appSettings]);

  const handleDeleteProduct = useCallback(async (productId: string) => {
    try {
      await api.deleteProduct(productId);
      setProducts(prev => prev.filter(p => p.id !== productId));
      showToast('Supprimé.', 'fa-solid fa-trash-can');
    } catch (err) {
      showToast("Erreur de suppression.", "fa-solid fa-warning");
    }
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    handleNavigate({ name: 'home' });
    showToast(`Bienvenue, ${user.name} !`, "fa-solid fa-hand-sparkles");
    fetchData();
  };

  const handleLogout = async () => {
    await api.logout();
    setCurrentUser(null);
    handleNavigate({ name: 'home' });
    showToast("Déconnecté.", "fa-solid fa-arrow-right-from-bracket");
  };

  const fetchConversations = useCallback(async () => {
    if (currentUser) {
      const convs = await api.getConversationsForUser(currentUser.id);
      setConversations(convs);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const handleMessageSeller = useCallback(async (recipient: User, product: Product) => {
    if (!currentUser) {
      handleNavigate({ name: 'auth' });
      return;
    }
    const conversation = await api.findOrCreateConversation(currentUser, recipient, product);
    await fetchConversations();
    handleNavigate({ name: 'chat', conversationId: conversation.id });
  }, [currentUser, handleNavigate, fetchConversations]);

  const handleSendMessage = useCallback(async (conversationId: string, text: string) => {
    if (!currentUser) return;
    try {
      const newMessage = await api.sendMessage(conversationId, text, currentUser.id);
      setConversations(prev => prev.map(c => {
        if (c.id === conversationId) {
          return {
            ...c,
            messages: [...c.messages, newMessage],
            lastMessageTimestamp: newMessage.timestamp
          };
        }
        return c;
      }));
    } catch (err) {
      showToast("Message non envoyé.", "fa-solid fa-warning");
    }
  }, [currentUser]);

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', next);
      document.documentElement.classList.toggle('dark');
      return next;
    });
  };

  const renderView = () => {
    if (view.name === 'auth') {
      return <AuthPage onLogin={handleLogin} showToast={showToast} onNavigate={handleNavigate} logoUrl={appContent.logoUrl} />
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
            cartItems={cartItems}
            onAddToCart={handleAddToCart}
            onPurchase={handleCreateOrder}
            currentUser={currentUser}
            onReportProduct={setProductToReport}
            onMessageSeller={handleMessageSeller}
            showToast={showToast}
            appSettings={appSettings}
          />;
        case 'addItem':
          return <AddItemPage onAddItem={handleAddItem} onCancel={() => handleNavigate({ name: 'home' })} />;
        case 'editItem':
          return <EditItemPage
            product={view.product}
            onUpdateItem={handleUpdateItem}
            onCancel={() => currentUser ? handleNavigate({ name: 'profile', user: currentUser }) : handleNavigate({ name: 'home' })}
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
            onNavigate={handleNavigate}
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
            appContent={{ ...appContent }}
            onUpdateSettings={() => { }}
            products={products}
            users={users}
            transactions={[]}
            onProductStatusChange={() => { }}
            showToast={showToast}
            onContentUpdate={() => { }}
            onToggleUserProStatus={() => { }}
          />
        case 'chat':
          return <ChatPage
            currentUser={currentUser!}
            conversations={conversations}
            onNavigate={handleNavigate}
            onSendMessage={handleSendMessage}
            initialConversationId={view.conversationId}
            isConversationsLoading={isLoading}
          />;
        case 'orders':
          return <OrdersPage
            currentUser={currentUser!}
            orders={orders}
            showToast={showToast}
            onNavigate={handleNavigate}
          />
        case 'cart':
          return <CartPage
            currentUser={currentUser!}
            cartItems={cartItems}
            allProducts={products}
            onRemoveFromCart={handleRemoveFromCart}
            onPurchase={handleCreateOrder}
            onNavigate={handleNavigate}
            appSettings={appSettings}
          />
        default:
          return <div>Page not found</div>;
      }
    })();

    return (
      <div className="min-h-screen bg-secondary dark:bg-slate-900 font-sans transition-colors duration-300">
        <Header
          onNavigate={handleNavigate}
          user={currentUser}
          onLogout={handleLogout}
          theme={theme}
          toggleTheme={toggleTheme}
          savedItemsCount={savedItems.size}
          cartItemsCount={cartItems.size}
          allProducts={products}
          logoUrl={appContent.logoUrl}
        />
        <main className="pt-28">
          {mainContent}
        </main>
        {toast && <Toast key={toast.id} message={toast.message} icon={toast.icon} />}
        {productToReport && <ReportModal product={productToReport} onClose={() => setProductToReport(null)} onSubmit={() => { }} />}
        {isAddingBalance && currentUser && <AddBalanceModal onClose={() => setIsAddingBalance(false)} onAddBalance={handleAddBalance} />}
        {isProModalOpen && currentUser && <ProModal onClose={() => setIsProModalOpen(false)} onSubscribe={() => { }} settings={appSettings} currentUser={currentUser} />}
      </div>
    );
  };

  return renderView();
};

export default App;