import React from 'react';
import type { Report } from '../../types';
import { ReportStatus } from '../../types';
import { CardHeader, CardTitle, CardContent, CardDescription } from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

interface ReportTableProps {
    reports: Report[];
    onStatusChange: (reportId: string, status: ReportStatus) => void;
    onViewProduct: (productId: string) => void;
}

const ReportTable: React.FC<ReportTableProps> = ({ reports, onStatusChange, onViewProduct }) => {

    const getStatusBadgeVariant = (status: ReportStatus) => {
        switch (status) {
            case ReportStatus.Pending: return 'secondary';
            case ReportStatus.Resolved: return 'default';
            case ReportStatus.Dismissed: return 'destructive';
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
                <CardTitle>Signalements</CardTitle>
                <CardDescription>Gérez les rapports d'abus et les articles signalés.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">Date</th>
                                <th scope="col" className="px-6 py-3">Article</th>
                                <th scope="col" className="px-6 py-3">Raison</th>
                                <th scope="col" className="px-6 py-3">Statut</th>
                                <th scope="col" className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reports.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-text-light">
                                        Aucun signalement en attente.
                                    </td>
                                </tr>
                            ) : (
                                reports.map(report => (
                                    <tr key={report.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                        <td className="px-6 py-4 whitespace-nowrap text-xs">{formatDate(report.createdAt)}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-3">
                                                <img src={report.product.images[0]} alt="" className="w-8 h-8 rounded object-cover" />
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-text-main dark:text-secondary truncate max-w-[150px]">{report.product.title}</span>
                                                    <span className="text-[10px] text-text-light">ID: {report.product.id.substring(0, 8)}...</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-text-main dark:text-secondary">{report.reason}</span>
                                                {report.details && <span className="text-xs text-text-light italic truncate max-w-[200px]">"{report.details}"</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant={getStatusBadgeVariant(report.status)}>{report.status}</Badge>
                                        </td>
                                        <td className="px-6 py-4 space-x-2 whitespace-nowrap">
                                            {report.status === ReportStatus.Pending ? (
                                                <>
                                                    <Button className="h-8 px-3 text-xs" onClick={() => onStatusChange(report.id, ReportStatus.Resolved)}>
                                                        <i className="fa-solid fa-check mr-2"></i>Résoudre
                                                    </Button>
                                                    <Button variant="outline" className="h-8 px-3 text-xs" onClick={() => onStatusChange(report.id, ReportStatus.Dismissed)}>
                                                        <i className="fa-solid fa-xmark mr-2"></i>Ignorer
                                                    </Button>
                                                </>
                                            ) : (
                                                <span className="text-xs text-text-light flex items-center">
                                                    <i className="fa-solid fa-circle-info mr-2"></i>Traité
                                                </span>
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

export default ReportTable;
