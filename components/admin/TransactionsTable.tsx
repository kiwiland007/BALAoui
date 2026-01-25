import React from 'react';
import type { Transaction } from '../../types';
import { TransactionType, TransactionStatus } from '../../types';
import { CardHeader, CardTitle, CardContent, CardDescription } from '../ui/Card';
import Badge from '../ui/Badge';

interface TransactionsTableProps {
    transactions: Transaction[];
    onSearchChange: (query: string) => void;
}

const TransactionsTable: React.FC<TransactionsTableProps> = ({ transactions, onSearchChange }) => {

    const getTypeBadgeVariant = (type: TransactionType) => {
        switch (type) {
            case TransactionType.Sale: return 'default';
            case TransactionType.Feature: return 'secondary';
            case TransactionType.Bump: return 'outline';
            default: return 'outline';
        }
    }
    
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    return (
        <>
            <CardHeader>
                <CardTitle>Journal des Transactions</CardTitle>
                <CardDescription>Suivez toutes les activités financières sur la plateforme.</CardDescription>
                 <div className="relative pt-2">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light dark:text-gray-400 pt-2">
                      <i className="fa fa-search"></i>
                    </span>
                    <input 
                        type="text" 
                        placeholder="Rechercher (utilisateur, article, type...)"
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 text-text-main dark:text-secondary rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-primary/50"
                    />
                </div>
            </CardHeader>
            <CardContent>
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">Date</th>
                                <th scope="col" className="px-6 py-3">Utilisateur</th>
                                <th scope="col" className="px-6 py-3">Type</th>
                                <th scope="col" className="px-6 py-3">Article</th>
                                <th scope="col" className="px-6 py-3">Montant</th>
                                <th scope="col" className="px-6 py-3">Statut</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map(t => (
                                <tr key={t.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-6 py-4 whitespace-nowrap">{formatDate(t.date)}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-2">
                                            <img src={t.user.avatarUrl} alt={t.user.name} className="w-6 h-6 rounded-full" />
                                            <span>{t.user.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge variant={getTypeBadgeVariant(t.type)}>{t.type}</Badge>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        {t.product?.title || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 font-semibold">{t.amount.toFixed(2)} MAD</td>
                                     <td className="px-6 py-4">
                                        <span className="flex items-center text-xs font-semibold text-green-600">
                                          <i className="fa-solid fa-check-circle mr-1.5"></i>
                                          {t.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </>
    )
}

export default TransactionsTable;