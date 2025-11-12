// FIX: Import React as a namespace to fix JSX type errors.
import * as React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  change?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, change, className = '', style }) => {
  return (
    // FIX: Add style prop to allow dynamic styling, e.g., for background colors.
    <div className={`bg-gray-surface border border-gray-border rounded-lg shadow-sm p-6 ${className}`} style={style}>
      <div className="text-sm text-text-muted uppercase tracking-wider font-medium mb-1">{label}</div>
      <div className="text-4xl font-extrabold text-text-main">{value}</div>
      {change && <div className="text-sm mt-2 text-text-muted">{change}</div>}
    </div>
  );
};

export default StatCard;
