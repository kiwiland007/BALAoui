import React, { useState, useMemo } from 'react';
import type { View, Product, User, Transaction } from '../types';
import type { AppSettings, AppContent } from '../App';
import { ProductStatus, TransactionType } from '../types';
import { Card } from '../components/ui/Card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import StatCard from '../components/admin/StatCard';
import UserTable from '../components/admin/UserTable';
import ProductTable from '../components/admin/ProductTable';
import CategoryChart from '../components/admin/CategoryChart';
import AdminSettings from '../components/admin/AdminSettings';
import TransactionsTable from '../components/admin/TransactionsTable';
import AdminPayments from '../components/admin/AdminPayments';
import AdminContent from '../components/admin/AdminContent';
import ConfirmationModal from '../components/ConfirmationModal';

interface AdminPageProps {
  onNavigate: (view: View) => void;
  appSettings: AppSettings;
  appContent: AppContent;
  onUpdateSettings: (newSettings: AppSettings) => void;
  products: Product[];
  users: User[];
  transactions: Transaction[];
  onProductStatusChange: (productId: string, status: ProductStatus) => void;
  showToast: (message: string, icon: string) => void;
  onContentUpdate: (newContent: AppContent) => void;
  onToggleUserProStatus: (userId: string) => void;
}

const AdminPage: React.FC<AdminPageProps> = ({ 
    onNavigate, 
    appSettings, 
    appContent,
    onUpdateSettings,
    products,
    users,
    transactions,
    onProductStatusChange,
    showToast,
    onContentUpdate,
    onToggleUserProStatus,
}) => {
    const [userSearch, setUserSearch] = useState('');
    const [productSearch, setProductSearch] = useState('');
    const [transactionSearch, setTransactionSearch] = useState('');
    const [userToConfirmToggle, setUserToConfirmToggle] = useState<User | null>(null);

    const salesRevenue = transactions
        .filter(t => t.type === TransactionType.Sale)
        .reduce((acc, t) => acc + t.amount, 0);

    // FIX: Ensure appSettings.commission is treated as a number to prevent arithmetic operation errors.
    const commissionRevenue = salesRevenue * (Number(appSettings.commission) / 100);

    const boostRevenue = transactions
        .filter(t => t.type === TransactionType.Bump || t.type === TransactionType.Feature)
        .reduce((acc, t) => acc + t.amount, 0);
    
    const pendingProducts = products.filter(p => p.status === ProductStatus.Pending).length;

    const categoryData = useMemo(() => {
        // FIX: Replaced generic type argument on `reduce` with a type assertion on the initial value
        // to resolve a TypeScript error and ensure correct type inference for the accumulator.
        const counts = products.reduce((acc, product) => {
            acc[product.category] = (acc[product.category] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(counts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, [products]);

    const filteredUsers = useMemo(() => {
        return users.filter(user => user.name.toLowerCase().includes(userSearch.toLowerCase()));
    }, [users, userSearch]);

    const filteredProducts = useMemo(() => {
        return products.filter(product => product.title.toLowerCase().includes(productSearch.toLowerCase()));
    }, [products, productSearch]);

    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => 
            t.user.name.toLowerCase().includes(transactionSearch.toLowerCase()) ||
            (t.product && t.product.title.toLowerCase().includes(transactionSearch.toLowerCase())) ||
            t.type.toLowerCase().includes(transactionSearch.toLowerCase())
        );
    }, [transactions, transactionSearch]);


    return (
        <div className="container mx-auto px-4 py-8">
            {userToConfirmToggle && (
                <ConfirmationModal
                  title={`Confirmer le changement de statut`}
                  onClose={() => setUserToConfirmToggle(null)}
                  onConfirm={() => {
                      onToggleUserProStatus(userToConfirmToggle.id);
                      setUserToConfirmToggle(null);
                  }}
                  confirmText="Confirmer"
                >
                  Êtes-vous sûr de vouloir {userToConfirmToggle.isPro ? 'révoquer le statut Pro de' : 'promouvoir'} {userToConfirmToggle.name} ?
                </ConfirmationModal>
            )}

            <h1 className="text-3xl font-bold text-text-main dark:text-secondary mb-8">Tableau de Bord Administrateur</h1>
            
            <Tabs defaultValue="dashboard">
                <TabsList className="mb-8 flex flex-wrap h-auto">
                    <TabsTrigger value="dashboard"><i className="fa-solid fa-chart-pie mr-2"></i>Tableau de bord</TabsTrigger>
                    <TabsTrigger value="users"><i className="fa-solid fa-users mr-2"></i>Utilisateurs</TabsTrigger>
                    <TabsTrigger value="products"><i className="fa-solid fa-box mr-2"></i>Articles</TabsTrigger>
                    <TabsTrigger value="transactions"><i className="fa-solid fa-receipt mr-2"></i>Transactions</TabsTrigger>
                    <TabsTrigger value="settings"><i className="fa-solid fa-cogs mr-2"></i>Paramètres</TabsTrigger>
                    <TabsTrigger value="payments"><i className="fa-solid fa-credit-card mr-2"></i>Paiements</TabsTrigger>
                    <TabsTrigger value="content"><i className="fa-solid fa-file-lines mr-2"></i>Contenu</TabsTrigger>
                </TabsList>

                <TabsContent value="dashboard">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard icon="fa-sack-dollar" title="Revenus (Commission)" value={`${commissionRevenue.toFixed(2)} MAD`} />
                        <StatCard icon="fa-rocket" title="Revenus (Services)" value={`${boostRevenue.toFixed(2)} MAD`} />
                        <StatCard icon="fa-users" title="Utilisateurs" value={users.length.toString()} />
                        <StatCard icon="fa-hourglass-half" title="Articles en attente" value={pendingProducts.toString()} className={pendingProducts > 0 ? "text-amber-500" : ""} />
                    </div>
                    <Card>
                        <CategoryChart data={categoryData} />
                    </Card>
                </TabsContent>

                <TabsContent value="users">
                    <Card>
                        <UserTable 
                            users={filteredUsers} 
                            onSearchChange={setUserSearch} 
                            onShowToggleProConfirm={setUserToConfirmToggle}
                        />
                    </Card>
                </TabsContent>
                
                <TabsContent value="products">
                     <Card>
                        <ProductTable 
                            products={filteredProducts} 
                            onProductSelect={(product) => onNavigate({ name: 'productDetail', product })}
                            onStatusChange={onProductStatusChange}
                            onSearchChange={setProductSearch}
                        />
                    </Card>
                </TabsContent>

                <TabsContent value="transactions">
                    <Card>
                        <TransactionsTable 
                            transactions={filteredTransactions}
                            onSearchChange={setTransactionSearch}
                         />
                    </Card>
                </TabsContent>

                <TabsContent value="settings">
                    <AdminSettings settings={appSettings} onSave={onUpdateSettings} />
                </TabsContent>

                <TabsContent value="payments">
                    <AdminPayments showToast={showToast} />
                </TabsContent>

                <TabsContent value="content">
                    <AdminContent showToast={showToast} onContentUpdate={onContentUpdate} appContent={appContent} />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default AdminPage;