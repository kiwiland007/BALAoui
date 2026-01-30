import React from 'react';
import type { User } from '../../types';
import { CardHeader, CardTitle, CardContent, CardDescription } from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

interface UserTableProps {
    users: User[];
    onSearchChange: (query: string) => void;
    onShowToggleProConfirm: (user: User) => void;
    onToggleBan: (user: User) => void;
}

const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}

const UserTable: React.FC<UserTableProps> = ({ users, onSearchChange, onShowToggleProConfirm, onToggleBan }) => {
    return (
        <>
            <CardHeader>
                <CardTitle>Gestion des Utilisateurs</CardTitle>
                <CardDescription>Recherchez et gérez les utilisateurs de la plateforme.</CardDescription>
                <div className="relative pt-2">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light dark:text-gray-400 pt-2">
                        <i className="fa fa-search"></i>
                    </span>
                    <input
                        type="text"
                        placeholder="Rechercher par nom..."
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
                                <th scope="col" className="px-6 py-3">Utilisateur</th>
                                <th scope="col" className="px-6 py-3">Statut</th>
                                <th scope="col" className="px-6 py-3">Solde</th>
                                <th scope="col" className="px-6 py-3">Membre Depuis</th>
                                <th scope="col" className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id} className={`bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 ${user.isBanned ? 'opacity-60 bg-red-50/20 dark:bg-red-900/10' : ''}`}>
                                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white flex items-center space-x-3">
                                        <div className="relative">
                                            <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full" />
                                            {user.isBanned && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800"><i className="fa-solid fa-ban"></i></span>}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="flex items-center">
                                                {user.name}
                                                {user.isAdmin && <Badge variant="secondary" className="ml-2 text-[10px] py-0 h-4">Admin</Badge>}
                                            </span>
                                            <span className="text-xs text-text-light">{user.city}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col space-y-1">
                                            {user.isBanned && (
                                                <Badge variant="destructive" className="w-fit text-[10px]">BANNII</Badge>
                                            )}
                                            {user.isPro ? (
                                                <div className="flex flex-col">
                                                    <Badge className="border-accent bg-accent/10 text-accent dark:text-accent w-fit">
                                                        <i className="fa-solid fa-crown text-xs mr-1.5"></i>Pro
                                                    </Badge>
                                                    <span className="text-xs text-text-light mt-1">Expire le: {formatDate(user.proSubscriptionExpires)}</span>
                                                </div>
                                            ) : (
                                                !user.isBanned && <span className="text-text-light">Standard</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-semibold text-text-main dark:text-secondary">{user.balance.toFixed(2)} MAD</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{user.memberSince}</td>
                                    <td className="px-6 py-4 space-x-2 whitespace-nowrap">
                                        <Button variant="outline" className="h-8 px-3 text-xs" onClick={() => onShowToggleProConfirm(user)}>
                                            {user.isPro ? <><i className="fa-solid fa-arrow-down mr-2"></i>Révoquer Pro</> : <><i className="fa-solid fa-crown mr-2"></i>Promouvoir Pro</>}
                                        </Button>
                                        <Button
                                            variant={user.isBanned ? 'default' : 'ghost'}
                                            className={`h-8 px-3 text-xs ${user.isBanned ? '' : 'text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'}`}
                                            onClick={() => onToggleBan(user)}
                                        >
                                            {user.isBanned ? <><i className="fa-solid fa-check mr-2"></i>Débannir</> : <><i className="fa-solid fa-user-slash mr-2"></i>Bannir</>}
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </>
    );
}

export default UserTable;