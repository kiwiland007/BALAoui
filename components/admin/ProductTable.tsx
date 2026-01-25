import React from 'react';
import type { Product } from '../../types';
import { ProductStatus } from '../../types';
import { CardHeader, CardTitle, CardContent, CardDescription } from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

interface ProductTableProps {
    products: Product[];
    onProductSelect: (product: Product) => void;
    onStatusChange: (productId: string, status: ProductStatus) => void;
    onSearchChange: (query: string) => void;
}

const ProductTable: React.FC<ProductTableProps> = ({ products, onProductSelect, onStatusChange, onSearchChange }) => {

    const getStatusBadgeVariant = (status: ProductStatus) => {
        switch (status) {
            case ProductStatus.Approved: return 'default';
            case ProductStatus.Pending: return 'secondary';
            case ProductStatus.Rejected: return 'destructive';
            default: return 'outline';
        }
    }

    return (
        <>
            <CardHeader>
                <CardTitle>Gestion des Articles</CardTitle>
                <CardDescription>Modérez et gérez les articles en vente sur la plateforme.</CardDescription>
                 <div className="relative pt-2">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light dark:text-gray-400 pt-2">
                      <i className="fa fa-search"></i>
                    </span>
                    <input 
                        type="text" 
                        placeholder="Rechercher par titre..."
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
                                <th scope="col" className="px-6 py-3">Article</th>
                                <th scope="col" className="px-6 py-3">Vendeur</th>
                                <th scope="col" className="px-6 py-3">Prix</th>
                                <th scope="col" className="px-6 py-3">Statut</th>
                                <th scope="col" className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(product => (
                                <tr key={product.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white flex items-center space-x-3">
                                        <img src={product.images[0]} alt={product.title} className="w-10 h-10 object-cover rounded-md" />
                                        <span className="truncate max-w-[200px]">{product.title}</span>
                                    </td>
                                    <td className="px-6 py-4">{product.seller.name}</td>
                                    <td className="px-6 py-4">{product.price} MAD</td>
                                    <td className="px-6 py-4">
                                        <Badge variant={getStatusBadgeVariant(product.status)}>{product.status}</Badge>
                                    </td>
                                    <td className="px-6 py-4 space-x-2 whitespace-nowrap">
                                        {product.status === ProductStatus.Pending && (
                                            <>
                                                <Button className="h-8 px-3 text-xs bg-green-600 hover:bg-green-700" onClick={() => onStatusChange(product.id, ProductStatus.Approved)}>
                                                    <i className="fa-solid fa-check mr-2"></i>Approuver
                                                </Button>
                                                <Button variant="destructive" className="h-8 px-3 text-xs bg-orange-600 hover:bg-orange-700" onClick={() => onStatusChange(product.id, ProductStatus.Rejected)}>
                                                    <i className="fa-solid fa-times mr-2"></i>Rejeter
                                                </Button>
                                            </>
                                        )}
                                        {product.status !== ProductStatus.Pending && (
                                            <>
                                                 <Button variant="ghost" className="h-8 px-3 text-xs" onClick={() => onProductSelect(product)}>
                                                    <i className="fa-solid fa-eye mr-2"></i>Voir
                                                </Button>
                                                <Button variant="destructive" className="h-8 px-3 text-xs" onClick={() => alert(`Supprimer ${product.title}`)}>
                                                    <i className="fa-solid fa-trash-can mr-2"></i>Supprimer
                                                </Button>
                                            </>
                                        )}
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

export default ProductTable;