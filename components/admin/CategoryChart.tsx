import React from 'react';
import { CardHeader, CardTitle, CardContent, CardDescription } from '../ui/Card';
import type { ProductCategory } from '../../types';

interface ChartData {
    name: string;
    value: number;
}

interface CategoryChartProps {
    data: ChartData[];
}

const CategoryChart: React.FC<CategoryChartProps> = ({ data }) => {
    const maxValue = Math.max(...data.map(item => item.value), 0);

    const colors = [
        'bg-primary', 'bg-accent', 'bg-sky-500', 'bg-rose-500', 
        'bg-indigo-500', 'bg-lime-500', 'bg-pink-500', 'bg-slate-500'
    ];

    return (
        <>
            <CardHeader>
                <CardTitle>Répartition par Catégorie</CardTitle>
                <CardDescription>Visualisation du nombre d'articles par catégorie.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {data.map((item, index) => (
                        <div key={item.name} className="flex items-center">
                            <div className="w-1/3 text-sm text-text-light dark:text-gray-400 truncate pr-2">{item.name}</div>
                            <div className="w-2/3 bg-gray-200 dark:bg-gray-700 rounded-full h-5">
                                <div
                                    className={`${colors[index % colors.length]} h-5 rounded-full flex items-center justify-end pr-2 text-white text-xs font-bold`}
                                    style={{ width: `${maxValue > 0 ? (item.value / maxValue) * 100 : 0}%`, minWidth: '20px' }}
                                >
                                   {item.value}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </>
    );
};

export default CategoryChart;