// FIX: Import React as a namespace to fix JSX type errors.
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, useAlert } from '../App';
import Card from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';
import AccessDenied from '../components/ui/AccessDenied';
import ReportsTab from '../components/admin/ReportsTab';
import AdminManagementTab from '../components/admin/AdminManagementTab';
import AlertsTab from '../components/admin/AlertsTab';
import LogTab from '../components/admin/LogTab';
import SettingsTab from '../components/admin/SettingsTab';
import { AppUser, Permissions } from '../types';

interface AdminProps {
    onLogout: () => void;
    onUserUpdate: (user: AppUser) => void;
}

type AdminTab = 'reports' | 'admin' | 'alerts' | 'log' | 'settings';

const getInitialTab = (permissions: Permissions | undefined): AdminTab | '' => {
    if (!permissions) return '';
    if (permissions.adminPanel.reports.view) return 'reports';
    if (permissions.adminPanel.management.view) return 'admin';
    if (permissions.adminPanel.alerts.view) return 'alerts';
    if (permissions.adminPanel.log.view) return 'log';
    if (permissions.adminPanel.settings.view) return 'settings';
    return '';
};

const Admin: React.FC<AdminProps> = ({ onLogout, onUserUpdate }) => {
    const user = useUser();
    const navigate = useNavigate();
    const { addAlert } = useAlert();
    const [activeTab, setActiveTab] = React.useState<AdminTab | ''>(() => getInitialTab(user?.permissions));

    const canViewAny = user && user.permissions.adminPanel.view;

    React.useEffect(() => {
        if (user) {
            if (!canViewAny) {
                // If user loses all permissions for this page, redirect them.
                addAlert("You no longer have permission to view the Admin Panel.", 'warning');
                navigate('/dashboard', { replace: true });
                return;
            }
            // The type assertion here is safe because if activeTab is not an empty string, it must be a valid key of permissions.
            const currentTabIsValid = (() => {
                if (!activeTab) return false;
                switch (activeTab) {
                    case 'reports': return user.permissions.adminPanel.reports.view;
                    case 'admin': return user.permissions.adminPanel.management.view;
                    case 'alerts': return user.permissions.adminPanel.alerts.view;
                    case 'log': return user.permissions.adminPanel.log.view;
                    case 'settings': return user.permissions.adminPanel.settings.view;
                    default: return false;
                }
            })();

            if (!currentTabIsValid) {
                // If the current tab becomes invalid due to permission changes, switch to the first available one.
                setActiveTab(getInitialTab(user.permissions));
            }
        }
    }, [user, activeTab, canViewAny, navigate, addAlert]);

    if (!user) return <Spinner show={true} />;

    if (!canViewAny) {
        return <AccessDenied />;
    }

    const renderContent = () => {
        switch (activeTab) {
            case 'reports':
                return <ReportsTab />;
            case 'admin':
                return <AdminManagementTab onUserUpdate={onUserUpdate} />;
            case 'alerts':
                return <AlertsTab />;
            case 'log':
                return <LogTab />;
            case 'settings':
                return <SettingsTab onLogout={onLogout} />;
            default:
                 // This might show briefly if permissions change and no tabs are available before redirect.
                return <AccessDenied />;
        }
    };
    
    const TabButton: React.FC<{ tabId: AdminTab, label: string }> = ({ tabId, label }) => (
         <button 
            onClick={() => setActiveTab(tabId)} 
            className={`px-4 py-2 text-sm font-medium ${activeTab === tabId ? 'border-b-2 border-primary text-primary' : 'text-text-muted hover:text-text-main'}`}
        >
            {label}
        </button>
    );

    return (
        <div className="space-y-6">
            <Card>
                <div className="flex flex-wrap border-b border-gray-border -mx-6 -mt-6 px-4">
                    {user.permissions.adminPanel.reports.view && <TabButton tabId="reports" label="Reports" />}
                    {user.permissions.adminPanel.management.view && <TabButton tabId="admin" label="Management" />}
                    {user.permissions.adminPanel.alerts.view && <TabButton tabId="alerts" label="Alerts" />}
                    {user.permissions.adminPanel.log.view && <TabButton tabId="log" label="Audit Log" />}
                    {user.permissions.adminPanel.settings.view && <TabButton tabId="settings" label="Settings" />}
                </div>
                <div className="mt-6">
                    {renderContent()}
                </div>
            </Card>
        </div>
    );
};

export default Admin;