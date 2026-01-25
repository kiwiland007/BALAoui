import React from 'react';
import { Card, CardContent } from './ui/Card';

const SkeletonCard: React.FC = () => {
  return (
    <Card className="overflow-hidden animate-pulse">
      <div className="bg-gray-300 dark:bg-gray-700 w-full h-72"></div>
      <CardContent className="p-4">
        <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
        <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
        <div className="flex items-center mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-700"></div>
          <div className="ml-2 h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/3"></div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SkeletonCard;
