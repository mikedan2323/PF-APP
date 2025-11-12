// FIX: Import React as a namespace to fix JSX type errors.
import * as React from 'react';

interface CardProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ title, subtitle, actions, children, className = '' }) => {
  return (
    <div className={`bg-gray-surface border border-gray-border rounded-lg shadow-sm ${className}`}>
      {(title || actions) && (
        <div className="p-4 md:p-6 border-b border-gray-border flex justify-between items-center">
          <div>
            {title && <h2 className="text-xl font-bold text-text-main">{title}</h2>}
            {subtitle && <p className="text-sm text-text-muted mt-1">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      {/* FIX: Conditionally render children wrapper to avoid empty padding when children are not provided. */}
      {children && (
        <div className="p-4 md:p-6">
          {children}
        </div>
      )}
    </div>
  );
};

export default Card;
