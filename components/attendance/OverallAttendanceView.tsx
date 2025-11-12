// FIX: Import React as a namespace to fix JSX type errors.
import * as React from 'react';
import { api } from '../../services/api';
import { MemberAttendanceStat } from '../../types';
import Spinner from '../ui/Spinner';

type SortKey = 'presenceRate' | 'bibleRate' | 'bookRate' | 'uniformRate';
type SortDirection = 'desc' | 'asc';

const OverallAttendanceView: React.FC = () => {
    const [stats, setStats] = React.useState<MemberAttendanceStat[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [groupFilter, setGroupFilter] = React.useState('all');
    const [classFilter, setClassFilter] = React.useState('all');
    const [nameFilter, setNameFilter] = React.useState('');
    const [sortConfig, setSortConfig] = React.useState<{ key: SortKey; direction: SortDirection } | null>(null);
    const [orderedClasses, setOrderedClasses] = React.useState<string[]>([]);

    React.useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const [statsRes, membersRes] = await Promise.all([
                api.getOverallAttendanceStats(),
                api.getMembersData(),
            ]);

            if (statsRes.success) {
                setStats(statsRes.data);
            }
            if (membersRes.success) {
                setOrderedClasses(membersRes.data.classes);
            }
            setLoading(false);
        };

        fetchData();
    }, []);
    
    const uniqueGroups = React.useMemo(() => ['all', ...new Set(stats.map(s => s.group))], [stats]);
    const uniqueClasses = React.useMemo(() => ['all', ...orderedClasses], [orderedClasses]);
    
    const averageStats = React.useMemo(() => {
        const statsForAverage = stats.filter(stat => 
            (groupFilter === 'all' || stat.group === groupFilter) &&
            (classFilter === 'all' || stat.class === classFilter)
        );

        if (statsForAverage.length === 0 || (groupFilter === 'all' && classFilter === 'all')) {
            return null;
        }

        const totals = statsForAverage.reduce((acc, stat) => {
            acc.presenceRate += stat.presenceRate;
            acc.bibleRate += stat.bibleRate;
            acc.bookRate += stat.bookRate;
            acc.uniformRate += stat.uniformRate;
            return acc;
        }, { presenceRate: 0, bibleRate: 0, bookRate: 0, uniformRate: 0 });

        return {
            presenceRate: Math.round(totals.presenceRate / statsForAverage.length),
            bibleRate: Math.round(totals.bibleRate / statsForAverage.length),
            bookRate: Math.round(totals.bookRate / statsForAverage.length),
            uniformRate: Math.round(totals.uniformRate / statsForAverage.length),
        };
    }, [stats, groupFilter, classFilter]);
    
    const filteredAndSortedStats = React.useMemo(() => {
        let filtered = stats.filter(stat => 
            (groupFilter === 'all' || stat.group === groupFilter) &&
            (classFilter === 'all' || stat.class === classFilter) &&
            (stat.name.toLowerCase().includes(nameFilter.toLowerCase()))
        );

        if (sortConfig !== null) {
            filtered.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return filtered;
    }, [stats, groupFilter, classFilter, nameFilter, sortConfig]);

    const requestSort = (key: SortKey) => {
        let direction: SortDirection = 'desc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'desc') {
            direction = 'asc';
        } else if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            setSortConfig(null); // third click removes sort
            return;
        }
        setSortConfig({ key, direction });
    };

    const getSortIndicator = (key: SortKey) => {
        if (!sortConfig || sortConfig.key !== key) return null;
        return sortConfig.direction === 'desc' ? ' ▼' : ' ▲';
    };
    
    const RateBar: React.FC<{ rate: number }> = ({ rate }) => (
        <div className="flex items-center gap-2">
            <div className="w-full bg-gray-border rounded-full h-2.5">
                <div className="bg-primary h-2.5 rounded-full" style={{ width: `${rate}%` }}></div>
            </div>
            <span className="text-xs font-semibold text-text-muted w-10 text-right">{rate}%</span>
        </div>
    );

    if (loading) return <Spinner show={true} />;
    
    const inputStyles = "w-full bg-gray-input border-gray-border rounded-md text-sm p-2 focus:ring-primary focus:border-primary";

    const getAverageTitle = () => {
        const parts = [];
        if (groupFilter !== 'all') parts.push(groupFilter);
        if (classFilter !== 'all') parts.push(classFilter);
        if (parts.length === 0) return '';
        return `Averages for ${parts.join(' / ')}`;
    };

    return (
        <div>
            <div className="mb-10 grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-gray-border rounded-lg bg-gray-surface/50">
                <input
                    type="text"
                    placeholder="Filter by name..."
                    value={nameFilter}
                    onChange={e => setNameFilter(e.target.value)}
                    className={inputStyles}
                />
                <select value={groupFilter} onChange={e => setGroupFilter(e.target.value)} className={inputStyles}>
                    {uniqueGroups.map(g => <option key={g} value={g}>{g === 'all' ? 'All Groups' : g}</option>)}
                </select>
                <select value={classFilter} onChange={e => setClassFilter(e.target.value)} className={inputStyles}>
                    {uniqueClasses.map(c => <option key={c} value={c}>{c === 'all' ? 'All Classes' : c}</option>)}
                </select>
            </div>

            {averageStats && (
                <div className="mb-6 p-4 border border-gray-border rounded-lg bg-gray-base/50">
                    <h4 className="font-bold text-text-main mb-3">{getAverageTitle()}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-3">
                        <div>
                            <p className="text-sm font-medium text-text-muted">Presence</p>
                            <RateBar rate={averageStats.presenceRate} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-text-muted">Bible</p>
                            <RateBar rate={averageStats.bibleRate} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-text-muted">Book</p>
                            <RateBar rate={averageStats.bookRate} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-text-muted">Uniform</p>
                            <RateBar rate={averageStats.uniformRate} />
                        </div>
                    </div>
                </div>
            )}
            
            <div className="overflow-x-auto border border-gray-border rounded-lg">
                <table className="w-full text-sm">
                    <thead className="bg-gray-base text-left">
                        <tr>
                            <th className="p-3 font-medium text-text-muted">Member</th>
                            <th className="p-3 font-medium text-text-muted cursor-pointer" onClick={() => requestSort('presenceRate')}>Presence{getSortIndicator('presenceRate')}</th>
                            <th className="p-3 font-medium text-text-muted cursor-pointer" onClick={() => requestSort('bibleRate')}>Bible{getSortIndicator('bibleRate')}</th>
                            <th className="p-3 font-medium text-text-muted cursor-pointer" onClick={() => requestSort('bookRate')}>Book{getSortIndicator('bookRate')}</th>
                            <th className="p-3 font-medium text-text-muted cursor-pointer" onClick={() => requestSort('uniformRate')}>Uniform{getSortIndicator('uniformRate')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAndSortedStats.map(stat => (
                            <tr key={stat.memberId} className="border-t border-gray-border">
                                <td className="p-3 font-semibold text-text-main">{stat.name}<span className="block text-xs font-normal text-text-subtle">{stat.group} / {stat.class}</span></td>
                                <td className="p-3 w-1/5"><RateBar rate={stat.presenceRate} /></td>
                                <td className="p-3 w-1/5"><RateBar rate={stat.bibleRate} /></td>
                                <td className="p-3 w-1/5"><RateBar rate={stat.bookRate} /></td>
                                <td className="p-3 w-1/5"><RateBar rate={stat.uniformRate} /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {filteredAndSortedStats.length === 0 && (
                    <div className="text-center py-12 text-text-muted">
                        <p>No members match the current filters.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OverallAttendanceView;
