import * as React from 'react';
import Button from '../ui/Button';
import { useAlert, useUser } from '../../App';
import AttendancePointsModal from '../modals/AttendancePointsModal';
import HonourImageManagementModal from '../modals/HonourImageManagementModal';

interface SettingsTabProps {
    onLogout: () => void;
}

const SettingsTab: React.FC<SettingsTabProps> = ({ onLogout }) => {
    const { addAlert } = useAlert();
    const user = useUser();
    const [isPointsModalOpen, setIsPointsModalOpen] = React.useState(false);
    const [isImageModalOpen, setIsImageModalOpen] = React.useState(false);

    const handleAction = (action: string) => {
        addAlert(`${action} initiated! (This is a demo)`, 'success');
    }

    if (!user) return null;

    return (
        <>
            <div className="max-w-4xl mx-auto">
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
                    <div className="p-4 border border-gray-border rounded-lg flex justify-between items-center">
                        <div>
                            <h3 className="font-bold">Honour Image Library</h3>
                            <p className="text-sm text-text-muted">Manage the library of pre-approved images for honour patches.</p>
                        </div>
                        {user.permissions.adminPanel.settings?.canManageHonourImages ? (
                            <Button variant="outline" onClick={() => setIsImageModalOpen(true)}>Manage Images</Button>
                        ) : (
                            <Button variant="outline" disabled title="You do not have permission to edit this">Manage Images</Button>
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
            </div>
            <AttendancePointsModal 
                isOpen={isPointsModalOpen}
                onClose={() => setIsPointsModalOpen(false)}
            />
            <HonourImageManagementModal
                isOpen={isImageModalOpen}
                onClose={() => setIsImageModalOpen(false)}
            />
        </>
    );
};

export default SettingsTab;