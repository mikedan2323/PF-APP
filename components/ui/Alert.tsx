// FIX: Import React as a namespace to fix JSX type errors.
import * as React from 'react';
import { CheckCircle, XCircle, AlertTriangle } from 'react-feather';

interface AlertProps {
  message: string;
  type: 'success' | 'error' | 'warning';
  onClose: () => void;
}

const alertConfig = {
  success: {
    icon: CheckCircle,
    bg: 'bg-green-500/20',
    text: 'text-green-300',
    iconColor: 'text-success',
  },
  error: {
    icon: XCircle,
    bg: 'bg-danger/20',
    text: 'text-red-300',
    iconColor: 'text-danger',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-warning/20',
    text: 'text-amber-300',
    iconColor: 'text-warning',
  },
};

const Alert: React.FC<AlertProps> = ({ message, type, onClose }) => {
  const config = alertConfig[type];
  const Icon = config.icon;

  return (
    <div className={`p-4 rounded-lg shadow-lg flex items-start ${config.bg} border border-current`}>
      <div className="flex-shrink-0">
        <Icon className={`w-5 h-5 ${config.iconColor}`} />
      </div>
      <div className="ml-3">
        <p className={`text-sm font-medium ${config.text}`}>{message}</p>
      </div>
      <div className="ml-auto pl-3">
        <div className="-mx-1.5 -my-1.5">
          <button onClick={onClose} className={`inline-flex rounded-md p-1.5 ${config.text} hover:bg-black/20 focus:outline-none focus:ring-2 focus:ring-offset-2`}>
            <span className="sr-only">Dismiss</span>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Alert;