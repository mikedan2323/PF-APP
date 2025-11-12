// FIX: Import React as a namespace to fix JSX type errors.
import * as React from 'react';
import Card from '../components/ui/Card';
import TakeAttendanceForm from '../components/attendance/TakeAttendanceForm';
import ManageAttendanceView from '../components/attendance/ManageAttendanceView';
import OverallAttendanceView from '../components/attendance/OverallAttendanceView';
import Button from '../components/ui/Button';
import PrintAttendanceModal from '../components/modals/PrintAttendanceModal';
import { useUser } from '../App';
import Spinner from '../components/ui/Spinner';
import AccessDenied from '../components/ui/AccessDenied';

type Tab = 'take' | 'manage' | 'overall';

const Attendance: React.FC = () => {
    const user = useUser();
    const [activeTab, setActiveTab] = React.useState<Tab>('take');
    const [isPrintModalOpen, setIsPrintModalOpen] = React.useState(false);

    if (!user) return <Spinner show={true} />;

    const { permissions } = user;

    if (!permissions.attendance.view) {
        return <AccessDenied />;
    }

    const renderContent = () => {
        switch (activeTab) {
            case 'take':
                return permissions.attendance.tabs.take ? <TakeAttendanceForm /> : null;
            case 'manage':
                return permissions.attendance.tabs.manage ? <ManageAttendanceView /> : null;
            case 'overall':
                return permissions.attendance.tabs.overall ? <OverallAttendanceView /> : null;
            default:
                return null;
        }
    };
    
    return (
        <>
            <div className="space-y-6">
                <Card>
                    <div className="flex flex-wrap justify-between items-center gap-4">
                        <div className="flex border-b">
                            {permissions.attendance.tabs.take && <button onClick={() => setActiveTab('take')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'take' ? 'border-b-2 border-primary text-primary' : 'text-slate-500'}`}>Take Attendance</button>}
                            {permissions.attendance.tabs.manage && <button onClick={() => setActiveTab('manage')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'manage' ? 'border-b-2 border-primary text-primary' : 'text-slate-500'}`}>Manage Records</button>}
                            {permissions.attendance.tabs.overall && <button onClick={() => setActiveTab('overall')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'overall' ? 'border-b-2 border-primary text-primary' : 'text-slate-500'}`}>Overall Stats</button>}
                        </div>
                        <div className="flex gap-2">
                            {permissions.attendance.canPrint && <Button variant="outline" onClick={() => setIsPrintModalOpen(true)}>Print Sheet</Button>}
                        </div>
                    </div>
                </Card>
                <Card>
                    {renderContent()}
                </Card>
            </div>
            <PrintAttendanceModal isOpen={isPrintModalOpen} onClose={() => setIsPrintModalOpen(false)} />
        </>
    );
};

export default Attendance;