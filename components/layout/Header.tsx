// FIX: Import React as a namespace to fix JSX type errors.
import * as React from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, RefreshCw, ChevronsLeft, ChevronsRight, Bell, Sun, Moon } from 'react-feather';
import { useUser, useAlert, useTheme } from '../../App';
import Button from '../ui/Button';
import { api } from '../../services/api';
import { Notification } from '../../types';
import NotificationsModal from './NotificationsModal';

interface HeaderProps {
    onLogout: () => void;
    toggleMobileMenu: () => void;
    toggleSidebarCollapse: () => void;
    isSidebarCollapsed: boolean;
}

const Header: React.FC<HeaderProps> = ({ onLogout, toggleMobileMenu, toggleSidebarCollapse, isSidebarCollapsed }) => {
    const location = useLocation();
    const user = useUser();
    const { theme, toggleTheme } = useTheme();
    const [notifications, setNotifications] = React.useState<Notification[]>([]);
    const [isNotificationsOpen, setIsNotificationsOpen] = React.useState(false);
    
    const pageTitle = location.pathname.split('/').pop()?.replace('-', ' ')?.replace(/^\w/, c => c.toUpperCase()) || 'Dashboard';
    
    React.useEffect(() => {
        const fetchNotifications = async () => {
            const res = await api.getNotifications();
            if (res.success) {
                setNotifications(res.data);
            }
        };
        fetchNotifications();
    }, []);

    React.useEffect(() => {
        if(user) {
            const userName = user.individualName ? `${user.individualName} (${user.name})` : user.name;
            api.logAction(userName, 'Page View', `Navigated to ${pageTitle}`);
        }
    }, [location.pathname, user]);
    
    const handleMarkAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({...n, read: true})));
    };

    if (!user) return null;
    
    const displayName = user.individualName ? `${user.individualName} (${user.role})` : user.name;
    const displayRole = user.individualName ? user.name : user.role;
    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <header className="h-16 bg-gray-surface border-b border-gray-border flex-shrink-0 flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
                 <button onClick={toggleMobileMenu} className="text-text-muted hover:text-text-main md:hidden">
                    <Menu className="w-6 h-6" />
                 </button>
                 <button onClick={toggleSidebarCollapse} className="text-text-muted hover:text-text-main hidden md:block">
                    {isSidebarCollapsed ? <ChevronsRight className="w-6 h-6" /> : <ChevronsLeft className="w-6 h-6" />}
                 </button>
                 <h1 className="text-xl font-bold text-text-main hidden md:block">{pageTitle}</h1>
            </div>
            <div className="flex items-center gap-4">
                <button 
                  onClick={toggleTheme} 
                  className="text-text-muted hover:text-text-main"
                  title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                >
                  {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
                <button className="text-text-muted hover:text-text-main" title="Refresh Data" onClick={() => window.location.reload()}>
                    <RefreshCw className="w-5 h-5" />
                </button>
                <div className="relative">
                    <button onClick={() => setIsNotificationsOpen(prev => !prev)} className="relative text-text-muted hover:text-text-main">
                        <Bell className="w-6 h-6" />
                        {unreadCount > 0 && 
                            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-white text-xs">
                                {unreadCount}
                            </span>
                        }
                    </button>
                    <NotificationsModal 
                        isOpen={isNotificationsOpen} 
                        onClose={() => setIsNotificationsOpen(false)}
                        notifications={notifications}
                        onMarkAllAsRead={handleMarkAllAsRead}
                    />
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gray-border flex items-center justify-center font-bold text-primary">
                        {displayName.charAt(0).toUpperCase()}
                    </div>
                     <div className="flex items-center gap-4">
                        <div className="hidden md:block">
                            <div className="text-sm font-semibold text-text-main text-right">{displayName}</div>
                            <div className="text-xs text-text-muted text-right">{displayRole}</div>
                        </div>
                        <Button onClick={onLogout} size="sm" variant="danger">Log Out</Button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;