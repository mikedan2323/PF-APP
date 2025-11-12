import * as React from 'react';
import { api } from '../../services/api';
import { AlertSettings } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';
import { useAlert, useUser } from '../../App';

const AlertsTab: React.FC = () => {
    const user = useUser();
    const { addAlert } = useAlert();
    const [settings, setSettings] = React.useState<AlertSettings | null>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchSettings = async () => {
            setLoading(true);
            const data = await api.getAlertSettings();
            setSettings(data);
            setLoading(false);
        };
        fetchSettings();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setSettings(prev => {
            if (!prev) return null;
            return {
                ...prev,
                [name]: type === 'checkbox' ? checked : parseInt(value, 10) || 0
            };
        });
    };
    
    const handleSave = async () => {
        if (!settings || !user) return;
        setLoading(true);
        const res = await api.saveAlertSettings(settings);
        if (res.success) {
            addAlert('Alert settings have been updated.', 'success');
            const userName = user.individualName ? `${user.individualName} (${user.name})` : user.name;
            api.logAction(userName, 'Update Alert Settings', 'Alert thresholds and settings were updated.');
        } else {
            addAlert('Failed to save settings.', 'error');
        }
        setLoading(false);
    };
    
    if (loading || !user || !settings) return <Spinner show={true} />;

    const canEdit = user.permissions.adminPanel.alerts.canEdit;
    const inputStyles = "w-full px-3 py-2 bg-gray-input border border-gray-border rounded-md text-sm focus:ring-primary focus:border-primary placeholder:text-text-muted disabled:opacity-50";

    const SettingRow: React.FC<{ title: string; description: string; children: React.ReactNode }> = ({ title, description, children }) => (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center p-4 border-b border-gray-border last:border-b-0">
            <div className="md:col-span-2">
                <h4 className="font-semibold text-text-main">{title}</h4>
                <p className="text-sm text-text-muted">{description}</p>
            </div>
            <div>{children}</div>
        </div>
    );

    return (
        <div className="space-y-6">
            <Card title="Attention Item Alerts">
                <div className="-m-6">
                    <SettingRow title="Overdue Fees" description="Alert when a member's total unpaid and overdue fees exceed this amount.">
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-text-muted">$</span>
                            <input
                                type="number"
                                name="overdueFeeAmount"
                                value={settings.overdueFeeAmount}
                                onChange={handleInputChange}
                                disabled={!canEdit}
                                className={`${inputStyles} pl-7`}
                            />
                        </div>
                    </SettingRow>
                    <SettingRow title="Missing Attendance Items" description="Alert when a member forgets an item for a specified number of meetings.">
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs font-semibold text-text-muted">Book</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        name="missingBookThreshold"
                                        value={settings.missingBookThreshold}
                                        onChange={handleInputChange}
                                        disabled={!canEdit}
                                        className={inputStyles}
                                    />
                                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-text-muted text-xs">times</span>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-text-muted">Uniform</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        name="missingUniformThreshold"
                                        value={settings.missingUniformThreshold}
                                        onChange={handleInputChange}
                                        disabled={!canEdit}
                                        className={inputStyles}
                                    />
                                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-text-muted text-xs">times</span>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-text-muted">Bible</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        name="missingBibleThreshold"
                                        value={settings.missingBibleThreshold}
                                        onChange={handleInputChange}
                                        disabled={!canEdit}
                                        className={inputStyles}
                                    />
                                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-text-muted text-xs">times</span>
                                </div>
                            </div>
                        </div>
                    </SettingRow>
                     <SettingRow title="Low Attendance" description="Alert when a member's overall attendance percentage drops below this value.">
                        <div className="relative">
                            <input
                                type="number"
                                name="attendanceThreshold"
                                value={settings.attendanceThreshold}
                                onChange={handleInputChange}
                                disabled={!canEdit}
                                className={inputStyles}
                            />
                            <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-text-muted">%</span>
                        </div>
                    </SettingRow>
                     <SettingRow title="Low Inventory Warning" description="Alert when an item's stock is this many units above its set minimum stock level. (Set to 0 to alert at minimum).">
                        <div className="relative">
                             <input
                                type="number"
                                name="lowStockWarningThreshold"
                                value={settings.lowStockWarningThreshold}
                                onChange={handleInputChange}
                                disabled={!canEdit}
                                className={inputStyles}
                            />
                            <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-text-muted">items</span>
                        </div>
                    </SettingRow>
                     <SettingRow title="Incomplete Registration" description="Alert for active members who are missing their registration form or health information.">
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                name="incompleteRegistration"
                                checked={settings.incompleteRegistration}
                                onChange={handleInputChange}
                                disabled={!canEdit}
                                className="h-4 w-4 rounded text-primary bg-gray-input border-gray-border focus:ring-primary disabled:opacity-50"
                            />
                            <span className="text-sm text-text-muted">Enable Alert</span>
                        </label>
                    </SettingRow>
                </div>
                 {canEdit && (
                    <div className="mt-6 flex justify-end">
                        <Button onClick={handleSave} disabled={loading}>
                            {loading ? 'Saving...' : 'Save Settings'}
                        </Button>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default AlertsTab;