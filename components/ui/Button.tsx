import React from 'react';

// FIX: Added 'destructive' variant to support buttons for critical actions, resolving type errors.
type ButtonVariant = 'default' | 'outline' | 'ghost' | 'destructive';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const Button: React.FC<ButtonProps> = ({ className, variant = 'default', ...props }) => {
  const baseClasses = "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:pointer-events-none";
  
  const variantClasses = {
    default: 'bg-primary text-white hover:bg-primary-dark shadow-sm',
    outline: 'border border-primary text-primary bg-transparent hover:bg-primary/10',
    ghost: 'hover:bg-gray-100 dark:hover:bg-gray-800',
    destructive: 'bg-red-500 text-white hover:bg-red-600 shadow-sm',
  };

  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${className}`;

  return <button className={combinedClasses} {...props} />;
};

export default Button;
