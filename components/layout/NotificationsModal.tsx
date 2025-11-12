import * as React from 'react';
import { Notification } from '../../types';
import { AlertTriangle, DollarSign, Archive, X, UserX, TrendingDown, BookOpen } from 'react-feather';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkAllAsRead: () => void;
}

const iconMap: Record<Notification['type'], React.ReactElement> = {
    low_stock: <Archive className="w-5 h-5 text-warning" />,
    overdue_fee: <DollarSign className="w-5 h-5 text-danger" />,
    incomplete_registration: <UserX className="w-5 h-5 text-amber-400" />,
    low_attendance: <TrendingDown className="w-5 h-5 text-amber-400" />,
    missing_item: <BookOpen className="w-5 h-5 text-primary" />,
};

const NotificationsModal: React.FC<NotificationsModalProps> = ({ isOpen, onClose, notifications, onMarkAllAsRead }) => {
  const modalRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
            onClose();
        }
    };

    if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const unreadNotifications = notifications.filter(n => !n.read);

  return (
    <>
      {/* Backdrop for mobile view */}
      <div 
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
          onClick={onClose}
          aria-hidden="true"
      ></div>

      <div
        ref={modalRef}
        className="fixed inset-x-4 top-20 z-50 bg-gray-surface rounded-lg shadow-lg border border-gray-border md:absolute md:top-full md:right-0 md:mt-2 md:w-80 md:inset-x-auto md:top-auto"
      >
        <div className="flex justify-between items-center p-3 border-b border-gray-border">
          <h3 className="font-bold text-text-main">Notifications</h3>
          <button onClick={onClose} className="text-text-muted hover:text-text-main"><X size={18} /></button>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {unreadNotifications.length > 0 ? (
            unreadNotifications.map(notification => (
              <div key={notification.id} className="p-3 flex items-start gap-3 hover:bg-gray-border/50 border-b border-gray-border last:border-b-0">
                <div className="flex-shrink-0 mt-1">
                  {iconMap[notification.type] || <AlertTriangle className="w-5 h-5 text-text-muted" />}
                </div>
                <p className="text-sm text-text-muted">{notification.message}</p>
              </div>
            ))
          ) : (
            <div className="p-8 text-center">
              <p className="text-sm text-text-muted">You're all caught up!</p>
            </div>
          )}
        </div>
        <div className="p-2 bg-gray-base/50 text-center">
          <button 
            className="text-xs text-primary hover:underline disabled:text-text-subtle disabled:no-underline"
            onClick={onMarkAllAsRead}
            disabled={unreadNotifications.length === 0}
          >
            Mark all as read
          </button>
        </div>
      </div>
    </>
  );
};

export default NotificationsModal;