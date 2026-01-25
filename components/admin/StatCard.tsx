import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';

interface StatCardProps {
    icon: string;
    title: string;
    value: string;
    className?: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, className }) => {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-text-light">{title}</CardTitle>
                <i className={`fa-solid ${icon} text-text-light text-xl`}></i>
            </CardHeader>
            <CardContent>
                <div className={`text-2xl font-bold text-text-main dark:text-secondary ${className}`}>{value}</div>
            </CardContent>
        </Card>
    );
};

export default StatCard;