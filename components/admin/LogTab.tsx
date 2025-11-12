import * as React from 'react';
import { api } from '../../services/api';
import { LogEntry } from '../../types';
import Spinner from '../ui/Spinner';
import { useUser } from '../../App';
import moment from 'moment';

const LogTab: React.FC = () => {
    const user = useUser();
    const [logs, setLogs] = React.useState<LogEntry[]>([]);
    const [loading, setLoading] = React.useState(true);

    // Filters
    const [filters, setFilters] = React.useState({
        user: '',
        action: '',
        startDate: '',
        endDate: '',
    });

    const fetchData = async () => {
        const res = await api.getLogs();
        if (res.success) {
            setLogs(res.data);
        }
        setLoading(false);
    };

    React.useEffect(() => {
        if(user?.permissions.adminPanel.log.view) {
            fetchData();
            const interval = setInterval(fetchData, 5000); // Poll for new logs every 5 seconds
            return () => clearInterval(interval);
        } else {
             setLoading(false);
        }
    }, [user]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const filteredLogs = React.useMemo(() => {
        return logs.filter(log => {
            const logDate = new Date(log.timestamp);
            const startDate = filters.startDate ? new Date(filters.startDate) : null;
            const endDate = filters.endDate ? new Date(filters.endDate) : null;

            if (startDate && logDate < startDate) return false;
            if (endDate) {
                // Include the entire end day
                const endOfDay = new Date(endDate);
                endOfDay.setHours(23, 59, 59, 999);
                if (logDate > endOfDay) return false;
            }
            if (filters.user && !log.user.toLowerCase().includes(filters.user.toLowerCase())) return false;
            if (filters.action && !log.action.toLowerCase().includes(filters.action.toLowerCase())) return false;
            
            return true;
        });
    }, [logs, filters]);

    if (loading || !user) return <Spinner show={true} />;

    const inputStyles = "w-full px-3 py-2 bg-gray-input border border-gray-border rounded-md text-sm focus:ring-primary focus:border-primary placeholder:text-text-muted";

    return (
        <>
            <div className="mb-12 p-4 border border-gray-border rounded-lg bg-gray-surface/50 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                    <label className="text-xs text-text-muted">Start Date</label>
                    <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className={inputStyles} />
                </div>
                <div>
                    <label className="text-xs text-text-muted">End Date</label>
                    <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className={inputStyles} />
                </div>
                <div>
                    <label className="text-xs text-text-muted">Filter by User</label>
                    <input type="text" name="user" placeholder="Enter name..." value={filters.user} onChange={handleFilterChange} className={inputStyles} />
                </div>
                <div>
                    <label className="text-xs text-text-muted">Filter by Action</label>
                    <input type="text" name="action" placeholder="e.g., Delete User" value={filters.action} onChange={handleFilterChange} className={inputStyles} />
                </div>
            </div>

            <div className="overflow-x-auto max-h-[65vh] overflow-y-auto">
                <table className="w-full text-sm">
                    <thead className="text-left bg-gray-base sticky top-0">
                        <tr>
                            <th className="p-3 font-medium text-text-muted w-1/4">Timestamp</th>
                            <th className="p-3 font-medium text-text-muted w-1/4">User</th>
                            <th className="p-3 font-medium text-text-muted w-1/4">Action</th>
                            <th className="p-3 font-medium text-text-muted w-1/4">Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLogs.map((log) => (
                            <tr key={log.id} className="border-b border-gray-border">
                                <td className="p-3 text-text-muted" title={log.timestamp}>
                                    {moment(log.timestamp).format('YYYY-MM-DD HH:mm:ss')}
                                </td>
                                <td className="p-3 font-medium text-text-main">{log.user}</td>
                                <td className="p-3 text-primary">{log.action}</td>
                                <td className="p-3 text-text-muted">{log.details}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {filteredLogs.length === 0 && (
                    <div className="text-center py-12 text-text-muted">
                        <p>No log entries match the current filters.</p>
                    </div>
                )}
            </div>
        </>
    );
};

export default LogTab;