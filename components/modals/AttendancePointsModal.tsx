import * as React from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';
import { api } from '../../services/api';
import { AttendancePointsSettings } from '../../types';
import { useAlert, useUser } from '../../App';

interface AttendancePointsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AttendancePointsModal: React.FC<AttendancePointsModalProps> = ({ isOpen, onClose }) => {
    const user = useUser();
    const [settings, setSettings] = React.useState<AttendancePointsSettings | null>(null);
    const [loading, setLoading] = React.useState(false);
    const { addAlert } = useAlert();

    React.useEffect(() => {
        if (isOpen) {
            setLoading(true);
            api.getAttendancePointsSettings().then(data => {
                setSettings(data);
                setLoading(false);
            });
        }
    }, [isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSettings(prev => prev ? { ...prev, [name]: parseInt(value, 10) || 0 } : null);
    };

    const handleSave = async () => {
        if (!settings || !user) return;
        setLoading(true);
        await api.saveAttendancePointsSettings(settings);
        addAlert('Attendance point settings saved!', 'success');
        const userName = user.individualName ? `${user.individualName} (${user.name})` : user.name;
        api.logAction(userName, 'Update Attendance Points', 'Attendance point values were updated.');
        setLoading(false);
        onClose();
    };

    const inputStyles = "mt-1 w-full p-2 bg-gray-base border-gray-border rounded-md focus:ring-primary focus:border-primary";
    
    const SettingInput: React.FC<{ name: keyof AttendancePointsSettings, label: string, description: string }> = ({ name, label, description }) => (
        <div>
            <label htmlFor={name} className="block text-sm font-medium text-text-main">{label}</label>
            <p className="text-xs text-text-muted mb-1">{description}</p>
            <input
                id={name}
                name={name}
                type="number"
                value={settings?.[name] ?? ''}
                onChange={handleChange}
                className={inputStyles}
            />
        </div>
    );

    return (
        <Modal show={isOpen} onClose={onClose} title="Configure Attendance Points" size="lg">
            <Spinner show={loading} />
            {settings ? (
                <>
                    <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-lg text-sm text-primary-dark dark:text-primary">
                        <h4 className="font-bold mb-1">Fair Scoring System</h4>
                        <p>
                            Points are calculated for each member based on the settings below. The group's total score is then divided by the total number of active members in that group. This ensures scoring is fair regardless of group size by rewarding participation rate.
                        </p>
                    </div>
                    <div className="space-y-6">
                        <div className="p-4 border border-gray-border rounded-lg bg-gray-surface/50">
                            <h4 className="font-semibold text-text-main mb-2">Presence</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <SettingInput name="present" label="Is Present" description="Points awarded for being present." />
                                <SettingInput name="absent" label="Is Absent" description="Points deducted for being absent." />
                            </div>
                        </div>

                        <div className="p-4 border border-gray-border rounded-lg bg-gray-surface/50">
                            <h4 className="font-semibold text-text-main mb-4">Attendance Items</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
                                {/* Bible Column */}
                                <div className="space-y-4 p-3 rounded-md border border-gray-border">
                                    <h5 className="text-sm font-medium text-center text-text-muted">Bible</h5>
                                    <SettingInput name="hasBible" label="Has Bible" description="Points for bringing Bible." />
                                    <SettingInput name="noBible" label="No Bible" description="Penalty for no Bible." />
                                </div>
                                {/* Book Column */}
                                <div className="space-y-4 p-3 rounded-md border border-gray-border">
                                    <h5 className="text-sm font-medium text-center text-text-muted">Book</h5>
                                    <SettingInput name="hasBook" label="Has Book" description="Points for bringing book." />
                                    <SettingInput name="noBook" label="No Book" description="Penalty for no book." />
                                </div>
                                {/* Uniform Column */}
                                <div className="space-y-4 p-3 rounded-md border border-gray-border">
                                    <h5 className="text-sm font-medium text-center text-text-muted">Uniform</h5>
                                    <SettingInput name="hasUniform" label="Has Uniform" description="Points for correct uniform." />
                                    <SettingInput name="noUniform" label="No Uniform" description="Penalty for incorrect uniform." />
                                </div>
                            </div>
                        </div>
                         <div className="p-4 border border-gray-border rounded-lg bg-gray-surface/50">
                            <h4 className="font-semibold text-text-main mb-2">Fee Penalties</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <SettingInput name="lateFeePenalty" label="Late Fee Penalty" description="Points deducted when a 'Late' fee is added." />
                                <SettingInput name="lateFeePaidCredit" label="Late Fee Paid Credit" description="Points credited back when a 'Late' fee is paid." />
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                 <p className="text-text-muted">Loading settings...</p>
            )}
             <div className="mt-6 flex justify-end gap-3">
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button onClick={handleSave} disabled={loading || !settings}>Save Settings</Button>
            </div>
        </Modal>
    );
};

export default AttendancePointsModal;