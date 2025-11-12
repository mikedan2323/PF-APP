// FIX: Import React as a namespace to fix JSX type errors.
import * as React from 'react';
import { api } from '../services/api';
import { Member, UniformRecord, Event, MemberAchievements, Fee, AlertSettings, AttendanceRecord, MemberAttendanceStat, InventoryItem, Notification, Group } from '../types';
import StatCard from '../components/ui/StatCard';
import Card from '../components/ui/Card';
import LeaderboardChart from '../components/charts/LeaderboardChart';
import Spinner from '../components/ui/Spinner';
import { ArrowUp, ArrowDown, CheckSquare, Award, Users, AlertTriangle } from 'react-feather';
import { useUser } from '../App';
import AccessDenied from '../components/ui/AccessDenied';
import UpcomingEvents from '../components/dashboard/UpcomingEvents';
import UniformOrderList from '../components/dashboard/UniformOrderList';
import QuickAttendanceModal from '../components/modals/QuickAttendanceModal';
import QuickPointsModal from '../components/modals/QuickPointsModal';
import QuickMemberViewModal from '../components/modals/QuickMemberViewModal';
import AttentionItems from '../components/dashboard/AttentionItems';

type AttentionItemData = {
    id: string;
    type: Notification['type'];
    message: string;
}

const Dashboard: React.FC = () => {
    const user = useUser();
    const [stats, setStats] = React.useState<{
        activeMembers: number;
        attendance: number;
        leaderboard: { group: string, total: number }[];
        events: Event[];
        uniforms: UniformRecord[];
        achievements: MemberAchievements[];
        fees: Fee[];
    } | null>(null);
    
    // State for dynamic attention items
    const [alertSettings, setAlertSettings] = React.useState<AlertSettings | null>(null);
    const [allMembers, setAllMembers] = React.useState<Member[]>([]);
    const [allGroups, setAllGroups] = React.useState<Group[]>([]);
    const [attendanceRecords, setAttendanceRecords] = React.useState<AttendanceRecord[]>([]);
    const [overallStats, setOverallStats] = React.useState<MemberAttendanceStat[]>([]);
    const [inventory, setInventory] = React.useState<InventoryItem[]>([]);

    const [loading, setLoading] = React.useState(true);
    const [activeModal, setActiveModal] = React.useState<'' | 'attendance' | 'points' | 'members'>('');

    React.useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const [membersRes, pointsRes, eventsRes, uniformRes, achievementRes, feesRes, settingsRes, attendanceRes, statsRes, inventoryRes, groupsRes] = await Promise.all([
                api.getMembersData(),
                api.getPointsData(),
                api.getEvents(),
                api.getUniformData(),
                api.getAchievementData(),
                api.getFeesData(),
                api.getAlertSettings(),
                api.getAttendanceRecords(),
                api.getOverallAttendanceStats(),
                api.getInventoryData(),
                api.getGroups(),
            ]);

            if (membersRes.success) setAllMembers(membersRes.data.members);
            if (groupsRes.success) setAllGroups(groupsRes.data);
            if (attendanceRes.success) setAttendanceRecords(attendanceRes.data);
            if (statsRes.success) setOverallStats(statsRes.data);
            if (inventoryRes.success) setInventory(inventoryRes.data.items);
            setAlertSettings(settingsRes);

            if (membersRes.success && pointsRes.success && eventsRes.success && uniformRes.success && achievementRes.success && feesRes.success) {
                setStats({
                    activeMembers: membersRes.data.members.filter((m: any) => m.status === 'Active').length,
                    attendance: 92, // mock
                    leaderboard: pointsRes.data.leaderboard,
                    events: eventsRes.data,
                    uniforms: uniformRes.data.members,
                    achievements: achievementRes.data.members,
                    fees: feesRes.data.fees,
                });
            }
            setLoading(false);
        };
        fetchData();
    }, []);
    
    const attentionItems = React.useMemo((): AttentionItemData[] => {
        if (!alertSettings || allMembers.length === 0 || !stats) return [];

        const items: AttentionItemData[] = [];
        let idCounter = 0;

        // 1. Incomplete Registration
        if (alertSettings.incompleteRegistration) {
            allMembers.forEach(member => {
                if (member.status === 'Active' && (!member.registration.form || !member.registration.healthInfo)) {
                    items.push({ id: `att_${idCounter++}`, type: 'incomplete_registration', message: `${member.fullName}: Incomplete registration` });
                }
            });
        }

        // 2. Overdue Fees
        const overdueFeesByMember: { [memberId: string]: number } = {};
        const now = new Date();
        stats.fees.forEach(fee => {
            if (fee.status === 'Unpaid' && new Date(fee.dueDate) < now) {
                overdueFeesByMember[fee.memberId] = (overdueFeesByMember[fee.memberId] || 0) + fee.amount;
            }
        });
        Object.entries(overdueFeesByMember).forEach(([memberId, totalOverdue]) => {
            if (totalOverdue > alertSettings.overdueFeeAmount) {
                const member = allMembers.find(m => m.id === memberId);
                items.push({ id: `att_${idCounter++}`, type: 'overdue_fee', message: `${member?.fullName}: $${totalOverdue.toFixed(2)} overdue` });
            }
        });

        // 3. Low Attendance
        overallStats.forEach(stat => {
            if (stat.presenceRate < alertSettings.attendanceThreshold) {
                items.push({ id: `att_${idCounter++}`, type: 'low_attendance', message: `${stat.name}: Low attendance (${stat.presenceRate}%)` });
            }
        });

        // 4. Missing Items
        const missedItemsCount: { [memberId: string]: { bible: number, book: number, uniform: number } } = {};
        allMembers.forEach(m => missedItemsCount[m.id] = { bible: 0, book: 0, uniform: 0 });

        attendanceRecords.forEach(record => {
            Object.keys(record.records).forEach(memberId => {
                const data = record.records[memberId];
                if(data.present && missedItemsCount[memberId]) {
                    if(!data.bible && !data.excused?.bible) missedItemsCount[memberId].bible++;
                    if(!data.book && !data.excused?.book) missedItemsCount[memberId].book++;
                    if(!data.uniform && !data.excused?.uniform) missedItemsCount[memberId].uniform++;
                }
            });
        });

        Object.entries(missedItemsCount).forEach(([memberId, counts]) => {
            const member = allMembers.find(m => m.id === memberId);
            if(!member) return;
            if (counts.bible >= alertSettings.missingBibleThreshold) {
                items.push({ id: `att_${idCounter++}`, type: 'missing_item', message: `${member.fullName}: Missed Bible ${counts.bible}x` });
            }
            if (counts.book >= alertSettings.missingBookThreshold) {
                items.push({ id: `att_${idCounter++}`, type: 'missing_item', message: `${member.fullName}: Missed Book ${counts.book}x` });
            }
            if (counts.uniform >= alertSettings.missingUniformThreshold) {
                items.push({ id: `att_${idCounter++}`, type: 'missing_item', message: `${member.fullName}: Missed Uniform ${counts.uniform}x` });
            }
        });
        
        // 5. Low Stock
        inventory.forEach(item => {
            if (item.quantity <= item.minStock + alertSettings.lowStockWarningThreshold) {
                 items.push({ id: `att_${idCounter++}`, type: 'low_stock', message: `Low stock: ${item.name} (${item.quantity} left)` });
            }
        });

        return items;
    }, [alertSettings, allMembers, stats, attendanceRecords, overallStats, inventory]);

    const groupColorMap = React.useMemo(() => new Map(allGroups.map(g => [g.name, g.color])), [allGroups]);


    if (loading || !stats || !user) return <Spinner show={true} />;
    
    const { permissions } = user;

    if (!permissions.dashboard.view) {
        return <AccessDenied />;
    }
    
    const QuickActionButton: React.FC<{ onClick: () => void, icon: React.ElementType, label: string }> = ({ onClick, icon: Icon, label }) => (
        <button onClick={onClick} className="flex flex-col items-center justify-center p-4 bg-gray-base hover:bg-gray-border rounded-lg text-center transition-colors w-full">
            <Icon className="w-8 h-8 text-primary mb-2" />
            <span className="text-sm font-semibold text-text-muted">{label}</span>
        </button>
    );

    const leaderGroup = stats.leaderboard[0]?.group;
    const leaderColor = leaderGroup ? groupColorMap.get(leaderGroup) : undefined;


    return (
        <>
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {permissions.dashboard.viewCards.activeMembers && (
                        <StatCard 
                            label="Active Members" 
                            value={stats.activeMembers} 
                            change={<span className="text-green-400 flex items-center"><ArrowUp size={14} className="mr-1"/> 2 this month</span>}
                        />
                    )}
                    {permissions.dashboard.viewCards.avgAttendance && (
                        <StatCard 
                            label="Avg. Attendance" 
                            value={`${stats.attendance}%`} 
                            change={<span className="text-red-400 flex items-center"><ArrowDown size={14} className="mr-1"/> 3% from last month</span>}
                        />
                    )}
                    {permissions.dashboard.viewCards.pointsLeader && (
                        <StatCard 
                            label="Points Leader" 
                            value={leaderGroup || 'N/A'}
                            change={<span>Total: {stats.leaderboard[0]?.total || 0} pts</span>}
                            className="transition-colors"
                            style={{ backgroundColor: leaderColor ? `${leaderColor}20` : undefined }}
                        />
                    )}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        {permissions.points.view && (
                            <Card title="Group Points Leaderboard">
                                <LeaderboardChart data={stats.leaderboard} groups={allGroups} />
                            </Card>
                        )}
                        {/* FIX: Corrected permission check to use 'viewUpcomingEvents' instead of non-existent 'viewCards.upcomingEvent'. */}
                        {permissions.dashboard.viewUpcomingEvents && (
                            <Card title="Upcoming Events">
                                <UpcomingEvents events={stats.events} />
                            </Card>
                        )}
                    </div>
                    <div className="space-y-6">
                        {permissions.dashboard.quickActions && (
                            <Card title="Quick Actions">
                                <div className="grid grid-cols-3 gap-2">
                                    {permissions.attendance.tabs.take && <QuickActionButton onClick={() => setActiveModal('attendance')} icon={CheckSquare} label="Attendance" />}
                                    {permissions.points.canAddRemove && <QuickActionButton onClick={() => setActiveModal('points')} icon={Award} label="Points" />}
                                    {permissions.members.view && <QuickActionButton onClick={() => setActiveModal('members')} icon={Users} label="Members" />}
                                </div>
                            </Card>
                        )}
                         <Card title="Attention Items" actions={<AlertTriangle className="text-warning" />}>
                            <AttentionItems items={attentionItems} />
                        </Card>
                        <Card title="Uniform & Pins to Order">
                            <UniformOrderList uniforms={stats.uniforms} achievements={stats.achievements} />
                        </Card>
                    </div>
                </div>
            </div>

            <QuickAttendanceModal isOpen={activeModal === 'attendance'} onClose={() => setActiveModal('')} />
            <QuickPointsModal isOpen={activeModal === 'points'} onClose={() => setActiveModal('')} />
            <QuickMemberViewModal isOpen={activeModal === 'members'} onClose={() => setActiveModal('')} />
        </>
    );
};

export default Dashboard;
