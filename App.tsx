import React, { useState, useCallback, useEffect } from 'react';
import type { Product, User, Conversation, Message, Transaction, Order, Report, Dispute, View } from './types';
import { ProductStatus, OrderStatus, TransactionType, TransactionStatus, ReportStatus, DisputeStatus, ShippingMethod } from './types';
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
  paymentMethods: {
    card: boolean;
    balance: boolean;
    cod: boolean;
  };
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
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);

  const [appSettings, setAppSettings] = useState<AppSettings>({
    commission: 5,
    bumpPrice: 10,
    featurePrice: 50,
    proSubscriptionPrice: 99,
    proCommission: 2,
    buyerProtectionFeePercent: 5,
    buyerProtectionFeeFixed: 5,
    shippingFee: 35,
    paymentMethods: {
      card: true,
      balance: true,
      cod: true,
    },
  });

  const [appContent, setAppContent] = useState<AppContent>({
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

  const fetchData = useCallback(async () => {
    try {
      const [pData, uData, oData, tData, rData, dData, settingsData, contentData] = await Promise.all([
        api.getProducts(),
        api.getUsers(),
        api.getOrders(),
        api.getTransactions(),
        api.getReports(),
        api.getDisputes(),
        api.getSettings<AppSettings>('app_settings'),
        api.getSettings<AppContent>('app_content'),
      ]);
      setProducts(pData);
      setUsers(uData);
      setOrders(oData);
      setTransactions(tData);
      setReports(rData);
      setDisputes(dData);
      if (settingsData) setAppSettings(settingsData);
      if (contentData) setAppContent(contentData);
    } catch (err) {
      console.error("Data fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchConversations = useCallback(async () => {
    if (currentUser) {
      const convs = await api.getConversationsForUser(currentUser.id);
      setConversations(convs);
    }
  }, [currentUser]);

  useEffect(() => {
    const initAuth = async () => {
      const user = await api.getCurrentUser();
      if (user?.isBanned) {
        await api.logout();
        setCurrentUser(null);
        showToast("Votre compte est suspendu.", "fa-solid fa-user-slash");
      } else {
        setCurrentUser(user);
      }

      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
          const user = await api.getCurrentUser();
          if (user?.isBanned) {
            await api.logout();
            setCurrentUser(null);
            showToast("Votre compte a été suspendu.", "fa-solid fa-user-slash");
          } else {
            setCurrentUser(user);
          }
        } else if (event === 'SIGNED_OUT') {
          setCurrentUser(null);
        }
      });

      return () => subscription.unsubscribe();
    };
    initAuth();
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (!currentUser) return;

    const channel = supabase
      .channel('realtime_messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const newMessage = payload.new;
        setConversations(prev => prev.map(c => {
          if (c.id === newMessage.conversation_id) {
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
    if (!product || product.status === ProductStatus.Sold || product.seller.id === currentUser.id) return;

    setCartItems(prev => {
      const newSet = new Set(prev);
      if (!newSet.has(productId)) {
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
      const imageUrls = await Promise.all(
        files.map(file => api.uploadImage(file, 'products'))
      );
      const finalProductData = { ...newProductData, images: imageUrls };
      const newProduct = await api.addProduct(finalProductData, currentUser.id);
      setProducts(prev => [newProduct, ...prev]);
      showToast("Article publié !", "fa-solid fa-check-circle");
      handleNavigate({ name: 'profile', user: currentUser });
    } catch (err) {
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

  const handleCreateOrder = useCallback(async (product: Product, buyerProtectionFee: number, shippingFee: number, totalAmount: number, shippingMethod: ShippingMethod) => {
    if (!currentUser) {
      handleNavigate({ name: 'auth' });
      return;
    }
    try {
      const newOrder = await api.createOrder(product, currentUser, buyerProtectionFee, shippingFee, totalAmount, shippingMethod);
      setOrders(prev => [newOrder, ...prev]);
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, status: ProductStatus.Sold } : p));
      showToast(`Commande passée!`, "fa-solid fa-check-circle");
      handleNavigate({ name: 'orders' });
      fetchData();
    } catch (err) {
      showToast("Erreur lors du paiement.", "fa-solid fa-warning");
    }
  }, [currentUser, handleNavigate, fetchData]);

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
      }
      const boostedUntil = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const product = products.find(p => p.id === productId);
      if (product) {
        const updated = await api.updateProduct({ ...product, boostedUntil, isFeatured: option === 'feature' });
        setProducts(prev => prev.map(p => p.id === productId ? updated : p));
      }
      showToast(`Boost activé!`, 'fa-solid fa-rocket');
      const finalUser = await api.getCurrentUser();
      setCurrentUser(finalUser);
    } catch (err) {
      showToast("Erreur lors du boost.", "fa-solid fa-warning");
    }
  }, [currentUser, appSettings, products]);

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

  const handleUpdateSettings = useCallback(async (newSettings: AppSettings) => {
    try {
      await api.updateSettings('app_settings', newSettings);
      setAppSettings(newSettings);
      showToast('Paramètres sauvegardés !', 'fa-solid fa-save');
    } catch (err) {
      showToast('Erreur lors de la sauvegarde.', 'fa-solid fa-warning');
    }
  }, []);

  const handleContentUpdate = useCallback(async (newContent: AppContent) => {
    setAppContent(newContent);
  }, []);

  const handleProductStatusChange = useCallback(async (productId: string, status: ProductStatus) => {
    try {
      const product = products.find(p => p.id === productId);
      if (product && currentUser) {
        const updated = await api.updateProduct({ ...product, status });
        setProducts(prev => prev.map(p => p.id === productId ? updated : p));
        showToast(`Statut mis à jour: ${status}`, 'fa-solid fa-check-circle');

        let notificationMsg = '';
        if (status === ProductStatus.Approved) {
          notificationMsg = `Félicitations! Votre article "${product.title}" a été approuvé et est maintenant visible sur la plateforme.`;
        } else if (status === ProductStatus.Rejected) {
          notificationMsg = `Désolé, votre article "${product.title}" a été refusé car il ne respecte pas nos conditions générales de vente. Veuillez le modifier et le soumettre à nouveau.`;
        }

        if (notificationMsg && product.seller.id !== currentUser.id) {
          const conv = await api.findOrCreateConversation(currentUser, product.seller, product);
          await api.sendMessage(conv.id, `[NOTIFICATION SYSTÈME] ${notificationMsg}`, currentUser.id);
          fetchConversations();
        }
      }
    } catch (err) {
      showToast('Erreur statut.', 'fa-solid fa-warning');
    }
  }, [products, currentUser, fetchConversations]);

  const handleToggleUserProStatus = useCallback(async (userId: string) => {
    try {
      const user = users.find(u => u.id === userId);
      if (user) {
        const isNowPro = !user.isPro;
        const updated = await api.updateProfile(userId, { isPro: isNowPro });
        setUsers(prev => prev.map(u => u.id === userId ? updated : u));
        showToast(`${user.name} est ${isNowPro ? 'maintenant PRO' : 'un utilisateur standard'}`, 'fa-solid fa-user-check');
      }
    } catch (err) {
      showToast('Erreur pro status.', 'fa-solid fa-warning');
    }
  }, [users]);

  const handleToggleUserBan = useCallback(async (userId: string, isBanned: boolean) => {
    try {
      const user = users.find(u => u.id === userId);
      if (user) {
        const updated = await api.toggleUserBan(userId, isBanned);
        setUsers(prev => prev.map(u => u.id === userId ? updated : u));
        showToast(`${user.name} a été ${isBanned ? 'banni' : 'débanni'}.`, isBanned ? 'fa-solid fa-user-slash' : 'fa-solid fa-user-check');
      }
    } catch (err) {
      showToast('Erreur lors du bannissement.', 'fa-solid fa-warning');
    }
  }, [users]);

  const handleReportProduct = useCallback(async (productId: string, reason: string, details?: string) => {
    if (!currentUser) return;
    try {
      await api.addReport(productId, currentUser.id, reason, details);
      showToast('Merci de nous avoir aidé. Votre signalement a été envoyé.', 'fa-solid fa-check-circle');
      setProductToReport(null);
    } catch (err) {
      showToast('Erreur signalement.', 'fa-solid fa-warning');
    }
  }, [currentUser]);

  const handleDisputeStatusChange = useCallback(async (disputeId: string, status: DisputeStatus) => {
    try {
      const updated = await api.updateDisputeStatus(disputeId, status);
      setDisputes(prev => prev.map(d => d.id === disputeId ? updated : d));
      showToast(`Statut du litige mis à jour: ${status}`, 'fa-solid fa-check-circle');

      const dispute = disputes.find(d => d.id === disputeId);
      if (dispute && currentUser) {
        const conv = await api.findOrCreateConversation(currentUser, dispute.initiator, undefined as any);
        await api.sendMessage(conv.id, `[NOTIFICATION SYSTÈME] Votre litige a été marqué comme ${status}. Resolution: ${updated.resolution || 'N/A'}`, currentUser.id);
        fetchConversations();
      }
    } catch (err) {
      showToast('Erreur mise à jour litige.', 'fa-solid fa-warning');
    }
  }, [disputes, currentUser, fetchConversations]);

  const handleReportStatusChange = useCallback(async (reportId: string, status: ReportStatus) => {
    try {
      const updated = await api.updateReportStatus(reportId, status);
      setReports(prev => prev.map(r => r.id === reportId ? updated : r));
      showToast(`Signalement mis à jour: ${status}`, 'fa-solid fa-check-circle');

      const report = reports.find(r => r.id === reportId);
      if (report && currentUser) {
        let msg = '';
        if (status === ReportStatus.Resolved) {
          msg = `Votre signalement concernant l'article "${report.product.title}" a été traité. Nous avons pris les mesures nécessaires. Merci de nous aider à garder BALAoui sûr !`;
        } else if (status === ReportStatus.Dismissed) {
          msg = `Après examen, nous n'avons pas trouvé de violation des règles concernant votre signalement pour "${report.product.title}". Merci de votre vigilance.`;
        }

        if (msg && report.reporter.id !== currentUser.id) {
          const conv = await api.findOrCreateConversation(currentUser, report.reporter, report.product);
          await api.sendMessage(conv.id, `[NOTIFICATION SYSTÈME] ${msg}`, currentUser.id);
          fetchConversations();
        }
      }
    } catch (err) {
      showToast('Erreur mise à jour signalement.', 'fa-solid fa-warning');
    }
  }, [reports, currentUser, fetchConversations]);

  const handleUpdateOrderShipping = useCallback(async (orderId: string, trackingNumber: string, shippingProvider: string) => {
    try {
      const updated = await api.updateOrderShipping(orderId, trackingNumber, shippingProvider);
      setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
      showToast('Informations d\'expédition mises à jour.', 'fa-solid fa-truck');

      if (currentUser) {
        const conv = await api.findOrCreateConversation(currentUser, updated.buyer, updated.product);
        await api.sendMessage(conv.id, `🕒 Bonne nouvelle ! Votre commande pour "${updated.product.title}" a été expédiée.\n📦 Transporteur : ${shippingProvider}\n📜 N° de suivi : ${trackingNumber}`, currentUser.id);
        fetchConversations();
      }
    } catch (err) {
      showToast('Erreur expédition.', 'fa-solid fa-warning');
    }
  }, [currentUser, fetchConversations]);

  const handleUpdateOrderStatus = useCallback(async (orderId: string, status: OrderStatus) => {
    try {
      const updated = await api.updateOrderStatus(orderId, status);
      setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
      showToast(`Commande mise à jour: ${status}`, 'fa-solid fa-check-circle');

      if (currentUser) {
        const recipient = currentUser.id === updated.buyer.id ? updated.seller : updated.buyer;
        const conv = await api.findOrCreateConversation(currentUser, recipient, updated.product);
        let msg = '';
        if (status === OrderStatus.Delivered) {
          msg = `✅ Colis reçu ! L'acheteur a confirmé la réception de "${updated.product.title}".`;
        } else if (status === OrderStatus.Completed) {
          msg = `🎉 Transaction terminée pour "${updated.product.title}". Les fonds ont été débloqués.`;
        }
        if (msg) {
          await api.sendMessage(conv.id, `[NOTIFICATION SYSTÈME] ${msg}`, currentUser.id);
        }
        fetchConversations();
      }
    } catch (err) {
      showToast('Erreur mise à jour commande.', 'fa-solid fa-warning');
    }
  }, [currentUser, fetchConversations]);

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', next);
      document.documentElement.classList.toggle('dark');
      return next;
    });
  };

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
          onUpdateSettings={handleUpdateSettings}
          products={products}
          users={users}
          transactions={transactions}
          reports={reports}
          onProductStatusChange={handleProductStatusChange}
          onReportStatusChange={handleReportStatusChange}
          showToast={showToast}
          onContentUpdate={handleContentUpdate}
          onToggleUserProStatus={handleToggleUserProStatus}
          onToggleUserBan={handleToggleUserBan}
          disputes={disputes}
          onDisputeStatusChange={handleDisputeStatusChange}
          orders={orders}
          onUpdateOrderShipping={handleUpdateOrderShipping}
        />;
      case 'auth':
        return <AuthPage
          onLogin={handleLogin}
          showToast={showToast}
          onNavigate={handleNavigate}
          logoUrl={appContent.logoUrl}
        />;
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
          onUpdateStatus={handleUpdateOrderStatus}
        />;
      case 'cart':
        return <CartPage
          currentUser={currentUser!}
          cartItems={cartItems}
          allProducts={products}
          onRemoveFromCart={handleRemoveFromCart}
          onPurchase={handleCreateOrder}
          onNavigate={handleNavigate}
          appSettings={appSettings}
        />;
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
      {productToReport && <ReportModal product={productToReport} onClose={() => setProductToReport(null)} onSubmit={handleReportProduct} />}
      {isAddingBalance && currentUser && <AddBalanceModal onClose={() => setIsAddingBalance(false)} onAddBalance={handleAddBalance} />}
      {isProModalOpen && currentUser && <ProModal onClose={() => setIsProModalOpen(false)} onSubscribe={() => { }} settings={appSettings} currentUser={currentUser} />}
    </div>
  );
};

export default App;