import React from 'react';

const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = ({ className, children, ...props }) => {
  return (
    <div className="relative">
      <select
        className={`w-full appearance-none bg-inherit border border-gray-300 dark:border-gray-600 rounded-lg py-2 pl-3 pr-8 focus:outline-none focus:ring-2 focus:ring-primary/50 ${className}`}
        {...props}
      >
        {children}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
        <i className="fa-solid fa-chevron-down text-xs"></i>
      </div>
    </div>
  );
};

export default Select;
