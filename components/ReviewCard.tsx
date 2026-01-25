
import React from 'react';
import type { Review } from '../types';
import Rating from './Rating';

const ReviewCard: React.FC<{ review: Review }> = ({ review }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex items-start space-x-4">
        <img src={review.author.avatarUrl} alt={review.author.name} className="w-12 h-12 rounded-full" />
        <div className="flex-1">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-bold text-text-main dark:text-secondary">{review.author.name}</p>
              <p className="text-xs text-text-light dark:text-gray-400">{review.date}</p>
            </div>
            <Rating rating={review.rating} />
          </div>
          <p className="text-text-main dark:text-gray-300 mt-3 leading-relaxed">{review.comment}</p>
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;
