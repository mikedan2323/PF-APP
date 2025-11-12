// FIX: Import React as a namespace to fix JSX type errors.
import * as React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'success';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-base transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    primary: 'bg-primary text-gray-base font-semibold hover:bg-primary/90 focus:ring-primary',
    secondary: 'bg-gray-light-border text-text-main hover:bg-gray-border focus:ring-gray-light-border',
    danger: 'bg-danger text-white hover:bg-red-600 focus:ring-danger',
    success: 'bg-success text-white hover:bg-green-600 focus:ring-success',
    outline: 'bg-transparent border border-gray-light-border text-text-muted hover:bg-gray-border hover:text-text-main focus:ring-primary',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  return (
    <button className={combinedClasses} {...props}>
      {children}
    </button>
  );
};

export default Button;