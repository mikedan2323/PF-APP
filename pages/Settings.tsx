// FIX: Import React as a namespace to fix JSX type errors.
import * as React from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useAlert, useUser } from '../App';
import AccessDenied from '../components/ui/AccessDenied';
import Spinner from '../components/ui/Spinner';
import AttendancePointsModal from '../components/modals/AttendancePointsModal';

interface SettingsProps {
    onLogout: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onLogout }) => {
    const { addAlert } = useAlert();
    const user = useUser();
    const [isPointsModalOpen, setIsPointsModalOpen] = React.useState(false);

    const handleAction = (action: string) => {
        addAlert(`${action} initiated! (This is a demo)`, 'success');
    }

    if (!user) return <Spinner show={true} />;

    if (!user.permissions.adminPanel.settings.view) {
        return <AccessDenied />;
    }

    return (
        <>
            <div className="space-y-6 max-w-4xl mx-auto">
                <Card title="Application Settings">
                    <p className="text-text-muted mb-6">Manage your account and application-wide data settings.</p>
                    <div className="space-y-4">
                        <div className="p-4 border border-gray-border rounded-lg flex justify-between items-center">
                            <div>
                                <h3 className="font-bold">Rebuild Uniform Matrix</h3>
                                <p className="text-sm text-text-muted">Recalculate all uniform completion percentages.</p>
                            </div>
                            <Button variant="outline" onClick={() => handleAction('Uniform Matrix Rebuild')}>Rebuild</Button>
                        </div>
                         <div className="p-4 border border-gray-border rounded-lg flex justify-between items-center">
                            <div>
                                <h3 className="font-bold">Refresh Dashboard Metrics</h3>
                                <p className="text-sm text-text-muted">Force a refresh of all stats on the main dashboard.</p>
                            </div>
                            <Button variant="outline" onClick={() => handleAction('Dashboard Refresh')}>Refresh</Button>
                        </div>
                        <div className="p-4 border border-gray-border rounded-lg flex justify-between items-center">
                            <div>
                                <h3 className="font-bold">Attendance Point System</h3>
                                <p className="text-sm text-text-muted">Customize points awarded for attendance records.</p>
                            </div>
                            {user.permissions.adminPanel.management.canEditPermissions ? (
                                <Button variant="outline" onClick={() => setIsPointsModalOpen(true)}>Configure Points</Button>
                            ) : (
                                <Button variant="outline" disabled title="You do not have permission to edit this">Configure Points</Button>
                            )}
                        </div>
                         <div className="p-4 border border-danger/30 bg-danger/20 rounded-lg flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-red-300">Log Out</h3>
                                <p className="text-sm text-red-400">Exit the application and end your current session.</p>
                            </div>
                            <Button variant="danger" onClick={onLogout}>Log Out</Button>
                        </div>
                    </div>
                </Card>
            </div>
            <AttendancePointsModal 
                isOpen={isPointsModalOpen}
                onClose={() => setIsPointsModalOpen(false)}
            />
        </>
    );
};

export default Settings;