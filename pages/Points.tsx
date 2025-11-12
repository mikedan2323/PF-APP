// FIX: Import React as a namespace to fix JSX type errors.
import * as React from 'react';
import { api } from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LeaderboardChart from '../components/charts/LeaderboardChart';
import { PointLog, Member, Group } from '../types';
import Spinner from '../components/ui/Spinner';
import { useUser } from '../App';
import AccessDenied from '../components/ui/AccessDenied';
import moment from 'moment';

const Points: React.FC = () => {
    const user = useUser();
    const [logs, setLogs] = React.useState<PointLog[]>([]);
    const [leaderboard, setLeaderboard] = React.useState<{ group: string, total: number }[]>([]);
    const [members, setMembers] = React.useState<Member[]>([]);
    const [groups, setGroups] = React.useState<Group[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [activeTab, setActiveTab] = React.useState<'add' | 'remove' | 'overall'>('add');
    
    // Form state
    const [selectedGroup, setSelectedGroup] = React.useState('');
    const [selectedMemberIds, setSelectedMemberIds] = React.useState<Set<string>>(new Set());
    const [isPerPersonMode, setIsPerPersonMode] = React.useState(false);

    // Analytics state
    const [analyticsMonth, setAnalyticsMonth] = React.useState<string>('all-time');
    const [analyticsGroup, setAnalyticsGroup] = React.useState<string>('all');
    const [analyticsSort, setAnalyticsSort] = React.useState<'highest' | 'lowest'>('highest');


    const fetchData = async () => {
        setLoading(true);
        const [pointsRes, membersRes, groupsRes] = await Promise.all([
            api.getPointsData(),
            api.getMembersData(),
            api.getGroups(),
        ]);
        
        if (pointsRes.success) {
            setLogs(pointsRes.data.logs);
            setLeaderboard(pointsRes.data.leaderboard);
            if(pointsRes.data.leaderboard.length > 0 && !selectedGroup) {
                setSelectedGroup(pointsRes.data.leaderboard[0].group);
            }
        }
        if(membersRes.success) {
            setMembers(membersRes.data.members);
        }
        if(groupsRes.success) {
            setGroups(groupsRes.data);
        }

        setLoading(false);
    };
    
    React.useEffect(() => {
        fetchData();
    }, []);
    
    const availableMonths = React.useMemo(() => {
        const monthSet = new Set<string>();
        logs.forEach(log => {
            const date = new Date(log.ts);
            const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            monthSet.add(monthStr);
        });
        return Array.from(monthSet).sort((a, b) => b.localeCompare(a)); // sort descending
    }, [logs]);

    const membersInSelectedGroup = React.useMemo(() => {
        return members.filter(m => m.group === selectedGroup && m.status === 'Active');
    }, [members, selectedGroup]);

    const handleGroupChange = (group: string) => {
        setSelectedGroup(group);
        setSelectedMemberIds(new Set());
    }

    const toggleMemberSelection = (memberId: string) => {
        setSelectedMemberIds(prev => {
            const next = new Set(prev);
            if (next.has(memberId)) {
                next.delete(memberId);
            } else {
                next.add(memberId);
            }
            return next;
        });
    }

    const handleSubmitPoints = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());
        const pointsValue = parseInt(data.points as string);
        
        const selectedMembers = members.filter(m => selectedMemberIds.has(m.id));
        const numSelected = selectedMembers.length;
    
        let finalPoints = pointsValue * (activeTab === 'remove' ? -1 : 1);
        if (isPerPersonMode && numSelected > 0) {
            finalPoints = pointsValue * numSelected * (activeTab === 'remove' ? -1 : 1);
        }
    
        await api.addPoints({
            ts: new Date().toISOString().split('T')[0],
            group: data.group as string,
            reason: data.reason as string,
            points: finalPoints,
            by: user?.name || 'User',
            members: selectedMembers.length > 0 ? selectedMembers.map(m => m.fullName) : undefined,
        });
        fetchData();
        e.currentTarget.reset();
        setSelectedMemberIds(new Set());
    };
    
    const memberAnalytics = React.useMemo(() => {
        if (logs.length === 0 || members.length === 0) return [];
        
        const memberNameMap = new Map<string, Member>();
        members.forEach(m => memberNameMap.set(m.fullName, m));

        const memberScores: { [memberId: string]: { member: Member; points: number; entries: number } } = {};
        
        logs
            .filter(log => {
                if (analyticsMonth === 'all-time') return true;
                const logDate = new Date(log.ts);
                const [year, month] = analyticsMonth.split('-').map(Number);
                return logDate.getFullYear() === year && logDate.getMonth() === month - 1;
            })
            .forEach(log => {
                if (log.members && log.members.length > 0) {
                    log.members.forEach(memberName => {
                        const member = memberNameMap.get(memberName);
                        if (member) {
                            if (!memberScores[member.id]) {
                                memberScores[member.id] = { member, points: 0, entries: 0 };
                            }
                            memberScores[member.id].points += log.points;
                            memberScores[member.id].entries += 1;
                        }
                    });
                }
            });

        let result = Object.values(memberScores);

        if (analyticsGroup !== 'all') {
            result = result.filter(score => score.member.group === analyticsGroup);
        }

        result.sort((a, b) => {
            if (analyticsSort === 'highest') {
                return b.points - a.points;
            } else {
                return a.points - b.points;
            }
        });

        return result;
    }, [logs, members, analyticsMonth, analyticsGroup, analyticsSort]);

    if (loading || !user) return <Spinner show={true} />;

    const { permissions } = user;
    
    if (!permissions.points.view) {
        return <AccessDenied />;
    }

    const uniqueGroups = [...new Set(leaderboard.map(l => l.group))];
    const inputStyles = "w-full mt-1 p-2 bg-gray-input border border-gray-border rounded-md";

    return (
        <>
        <div className="space-y-6">
            <Card>
                <div className="flex border-b border-gray-border">
                    {permissions.points.canAddRemove && (
                        <>
                            <button onClick={() => setActiveTab('add')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'add' ? 'border-b-2 border-primary text-primary' : 'text-text-muted'}`}>Add Points</button>
                            <button onClick={() => setActiveTab('remove')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'remove' ? 'border-b-2 border-primary text-primary' : 'text-text-muted'}`}>Remove Points</button>
                        </>
                    )}
                    <button onClick={() => setActiveTab('overall')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'overall' ? 'border-b-2 border-primary text-primary' : 'text-text-muted'}`}>Overall</button>
                </div>
                
                {(activeTab === 'add' || activeTab === 'remove') && permissions.points.canAddRemove ? (
                     <form className="mt-4" onSubmit={handleSubmitPoints}>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                            <div>
                                <label className="text-sm font-medium text-text-muted">Group</label>
                                <select name="group" value={selectedGroup} onChange={(e) => handleGroupChange(e.target.value)} className={inputStyles}>
                                    {uniqueGroups.map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                 <label className="text-sm font-medium text-text-muted">Reason</label>
                                <input type="text" name="reason" placeholder="e.g. Uniform Inspection" required className={inputStyles} />
                            </div>
                            <div>
                                 <label className="text-sm font-medium text-text-muted">Points</label>
                                <input type="number" name="points" required className={inputStyles} />
                            </div>
                        </div>
                        
                        {selectedGroup && (
                            <div className="mt-4 p-3 border border-gray-border rounded-md bg-gray-base/50">
                                <label className="text-sm font-medium text-text-muted">Select Members (Optional)</label>
                                <p className="text-xs text-text-subtle">If no members are selected, points will apply to the whole group. If members are selected, they will be listed as the reason.</p>
                                <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 max-h-32 overflow-y-auto">
                                    {membersInSelectedGroup.map(member => (
                                        <label key={member.id} className="flex items-center text-sm p-1">
                                            <input 
                                                type="checkbox" 
                                                className="mr-2 rounded text-primary focus:ring-primary" 
                                                checked={selectedMemberIds.has(member.id)}
                                                onChange={() => toggleMemberSelection(member.id)}
                                            />
                                            {member.fullName}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex justify-between items-center mt-4">
                            <div className="flex gap-4">
                               <label className="flex items-center"><input type="radio" name="mode" value="total" checked={!isPerPersonMode} onChange={() => setIsPerPersonMode(false)} className="mr-1 text-primary focus:ring-primary"/> Total Mode</label>
                               <label className="flex items-center"><input type="radio" name="mode" value="per_person" checked={isPerPersonMode} onChange={() => setIsPerPersonMode(true)} className="mr-1 text-primary focus:ring-primary"/> Per Person Mode</label>
                            </div>
                            <Button type="submit">{activeTab === 'add' ? 'Award Points' : 'Deduct Points'}</Button>
                        </div>
                     </form>
                ) : activeTab === 'overall' ? (
                    <div className="mt-4">
                        <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-gray-border rounded-lg bg-gray-base/50">
                            <div>
                                <label className="text-xs font-medium text-text-muted">Filter by Date</label>
                                <select value={analyticsMonth} onChange={e => setAnalyticsMonth(e.target.value)} className={`${inputStyles} mt-0`}>
                                    <option value="all-time">All Time</option>
                                    {availableMonths.map(month => (
                                        <option key={month} value={month}>{moment(month).format('MMMM YYYY')}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-text-muted">Filter by Group</label>
                                <select value={analyticsGroup} onChange={e => setAnalyticsGroup(e.target.value)} className={`${inputStyles} mt-0`}>
                                    <option value="all">All Groups</option>
                                    {uniqueGroups.map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-text-muted">Sort By</label>
                                <select value={analyticsSort} onChange={e => setAnalyticsSort(e.target.value as any)} className={`${inputStyles} mt-0`}>
                                    <option value="highest">Highest Points</option>
                                    <option value="lowest">Lowest Points</option>
                                </select>
                            </div>
                        </div>
                        <div className="overflow-x-auto -mx-4 md:-mx-6 max-h-[400px] overflow-y-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-base text-left sticky top-0">
                                    <tr>
                                        {['Rank', 'Member', 'Group', 'Class', 'Total Points', '# Entries'].map(h => <th key={h} className="p-3 font-medium text-text-muted">{h}</th>)}
                                    </tr>
                                </thead>
                                <tbody>
                                    {memberAnalytics.map((data, index) => (
                                        <tr key={data.member.id} className="border-b border-gray-border">
                                            <td className="p-3 text-text-muted">#{index + 1}</td>
                                            <td className="p-3 font-semibold text-text-main">{data.member.fullName}</td>
                                            <td className="p-3 text-text-muted">{data.member.group}</td>
                                            <td className="p-3 text-text-muted">{data.member.class}</td>
                                            <td className={`p-3 font-bold ${data.points > 0 ? 'text-green-400' : data.points < 0 ? 'text-red-400' : 'text-text-muted'}`}>
                                                {data.points > 0 ? `+${data.points}` : data.points}
                                            </td>
                                            <td className="p-3 text-text-muted text-center">{data.entries}</td>
                                        </tr>
                                    ))}
                                    {memberAnalytics.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="text-center p-8 text-text-muted">
                                                No member-specific point entries found for the selected filters.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : null}
            </Card>
            
            {(activeTab === 'add' || activeTab === 'remove') && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card title="Group Leaderboard">
                         <LeaderboardChart data={leaderboard} groups={groups} />
                    </Card>
                    <Card title="Recent Points Log">
                        <div className="overflow-x-auto -mx-6 max-h-[300px] overflow-y-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-base text-left sticky top-0">
                                    <tr>
                                        {['Date', 'Group', 'Reason', 'Points'].map(h => <th key={h} className="p-2 font-medium text-text-muted">{h}</th>)}
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.slice(0, 20).map(log => (
                                        <tr key={log.id} className="border-b border-gray-border last:border-0">
                                            <td className="p-2 text-text-muted">{log.ts}</td>
                                            <td className="p-2 font-medium text-text-main">{log.group}</td>
                                            <td className="p-2 text-text-muted">{log.reason}</td>
                                            <td className={`p-2 font-bold ${log.points > 0 ? 'text-green-400' : 'text-red-400'}`}>{log.points > 0 ? `+${log.points}` : log.points}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            )}
        </div>
        </>
    );
};

export default Points;