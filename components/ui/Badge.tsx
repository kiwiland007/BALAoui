import React from 'react';

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant;
}

const Badge: React.FC<BadgeProps> = ({ className, variant = 'default', ...props }) => {
  const baseClasses = 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2';

  const variantClasses = {
    default: 'border-transparent bg-primary text-white',
    secondary: 'border-transparent bg-accent text-white',
    destructive: 'border-transparent bg-red-500 text-white',
    outline: 'text-foreground',
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props} />
  );
};

export default Badge;