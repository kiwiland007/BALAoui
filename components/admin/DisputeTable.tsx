import React from 'react';
import type { Dispute } from '../../types';
import { DisputeStatus } from '../../types';
import { CardHeader, CardTitle, CardContent, CardDescription } from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

interface DisputeTableProps {
    disputes: Dispute[];
    onStatusChange: (disputeId: string, status: DisputeStatus) => void;
    onViewOrder: (orderId: string) => void;
}

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const DisputeTable: React.FC<DisputeTableProps> = ({ disputes, onStatusChange, onViewOrder }) => {
    return (
        <>
            <CardHeader>
                <CardTitle>Gestion des Litiges</CardTitle>
                <CardDescription>Résoudre les différends entre acheteurs et vendeurs.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">Initié par</th>
                                <th scope="col" className="px-6 py-3">Raison</th>
                                <th scope="col" className="px-6 py-3">Date</th>
                                <th scope="col" className="px-6 py-3">Statut</th>
                                <th scope="col" className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {disputes.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-text-light">
                                        Aucun litige en cours.
                                    </td>
                                </tr>
                            ) : (
                                disputes.map((dispute) => (
                                    <tr key={dispute.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                        <td className="px-6 py-4 flex items-center space-x-3">
                                            <img src={dispute.initiator.avatarUrl} className="w-8 h-8 rounded-full" alt="" />
                                            <span>{dispute.initiator.name}</span>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-text-main dark:text-secondary">
                                            <div>{dispute.reason}</div>
                                            <div className="text-xs text-text-light mt-1 truncate max-w-xs">{dispute.description}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {formatDate(dispute.createdAt)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant={
                                                dispute.status === DisputeStatus.Open ? 'destructive' :
                                                    dispute.status === DisputeStatus.Resolved ? 'default' : 'secondary'
                                            }>
                                                {dispute.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 space-x-2 whitespace-nowrap">
                                            <Button variant="outline" className="h-8 px-3 text-xs" onClick={() => onViewOrder(dispute.orderId)}>
                                                Voir Commande
                                            </Button>
                                            {dispute.status === DisputeStatus.Open && (
                                                <Button size="sm" className="h-8 px-3 text-xs" onClick={() => onStatusChange(dispute.id, DisputeStatus.Resolved)}>
                                                    Résoudre
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </>
    );
};

export default DisputeTable;
