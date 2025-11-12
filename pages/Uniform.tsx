// FIX: Import React as a namespace to fix JSX type errors.
import * as React from 'react';
import { Member, UniformRecord, MemberAchievements } from '../types';
import { api } from '../services/api';
import Card from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import { useUser, useAlert } from '../App';
import AccessDenied from '../components/ui/AccessDenied';
import PinsAchievements from './PinsAchievements';
import PrintUniformChecklistModal from '../components/modals/PrintUniformChecklistModal';
import UniformMemberCard from '../components/uniform/UniformMemberCard';
import OrderSummary from '../components/uniform/OrderSummary';
import OtherAchievements from '../components/uniform/OtherAchievements';
import PrintPinsChecklistModal from '../components/modals/PrintPinsChecklistModal';

export const uniformData = {
    items: [
        'Shirt (Type A)', 
        'Pants (Type A)',
        'Belt',
        'Beret',
        'Sash', 
        'Scarf', 
        'Slide', 
        'Club Crest',
        'World Pathfinder Patch',
        'Pathfinder Emblem',
        'Ontario Conference Patch',
    ],
    sizeItems: ['Shirt (Type A)', 'Pants (Type A)', 'Belt', 'Beret'],
};

type Tab = 'uniforms' | 'pins' | 'order' | 'other';
type GroupBy = 'member' | 'group' | 'class';

const CLASS_ORDER = ['Friend', 'Companion', 'Explorer', 'Ranger', 'Voyager', 'Guide'];

const Uniform: React.FC = () => {
    const user = useUser();
    const { addAlert } = useAlert();
    const [records, setRecords] = React.useState<(UniformRecord & { group: string, class: string })[]>([]);
    const [achievements, setAchievements] = React.useState<MemberAchievements[]>([]);
    const [members, setMembers] = React.useState<Member[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [activeTab, setActiveTab] = React.useState<Tab>('uniforms');
    const [isPrintModalOpen, setIsPrintModalOpen] = React.useState(false);
    const [isPinsPrintModalOpen, setIsPinsPrintModalOpen] = React.useState(false);
    const [groupBy, setGroupBy] = React.useState<GroupBy>('member');

    const fetchData = async () => {
        setLoading(true);
        const [uniformRes, membersRes, achievementsRes] = await Promise.all([
            api.getUniformData(),
            api.getMembersData(),
            api.getAchievementData()
        ]);

        if (membersRes.success) {
            setMembers(membersRes.data.members);
        }

        if (uniformRes.success && membersRes.success) {
            const membersData = membersRes.data.members;
            const enrichedRecords = uniformRes.data.members.map((record: UniformRecord) => {
                const member = membersData.find((m: Member) => m.id === record.memberId);
                return {
                    ...record,
                    group: member?.group || 'N/A',
                    class: member?.class || 'N/A'
                };
            });
            setRecords(enrichedRecords);
        }
        
        if (achievementsRes.success) {
            setAchievements(achievementsRes.data.members);
        }
        setLoading(false);
    };

    React.useEffect(() => {
        if(user?.permissions.uniform.view) {
            fetchData();
        } else {
            setLoading(false);
        }
    }, [user]);
    
    const handleItemChange = (memberId: string, item: string, value: boolean) => {
        setRecords(prev => prev.map(r => r.memberId === memberId ? {...r, items: {...r.items, [item]: value}} : r));
    };

    const handleSizeChange = (memberId: string, item: string, size: string) => {
         setRecords(prev => prev.map(r => r.memberId === memberId ? {...r, sizes: {...r.sizes, [item]: size}} : r));
    };

    const handleAchievementUpdate = async (memberId: string, achievement: string, type: 'earned' | 'received', value: boolean) => {
        const res = await api.updateAchievementStatus(memberId, achievement, type, value);
    
        if (res.success) {
            addAlert("Achievement status updated!", "success");
            setAchievements(prevAchievements =>
                prevAchievements.map(ach => {
                    if (ach.memberId === memberId) {
                        const updatedAchievements = { ...ach.achievements };
                        if (!updatedAchievements[achievement]) {
                            updatedAchievements[achievement] = { earned: false, received: false };
                        }
                        updatedAchievements[achievement] = { ...updatedAchievements[achievement], [type]: value };
                        return { ...ach, achievements: updatedAchievements };
                    }
                    return ach;
                })
            );
        } else {
            addAlert("Failed to update status.", "error");
        }
    };

    const groupedRecords = React.useMemo(() => {
        if (groupBy === 'member') return null;
        return records.reduce((acc, record) => {
            const key = record[groupBy];
            if (!acc[key]) {
                acc[key] = [];
            }
            acc[key].push(record);
            return acc;
        }, {} as Record<string, typeof records>);
    }, [records, groupBy]);

    if (loading || !user) return <Spinner show={true} />;
    const { permissions } = user;

    if (!permissions.uniform.view) return <AccessDenied />;

    const canEdit = permissions.uniform.canEditUniforms;
    const { tabs } = permissions.uniform;

    const renderContent = () => {
        switch(activeTab) {
            case 'uniforms':
                if (groupBy === 'member') {
                    return (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {records.map(record => {
                                const member = members.find(m => m.id === record.memberId);
                                return (
                                <UniformMemberCard 
                                    key={record.memberId}
                                    record={record}
                                    gender={member?.gender}
                                    canEdit={canEdit}
                                    onItemChange={handleItemChange}
                                    onSizeChange={handleSizeChange}
                                />
                            )})}
                        </div>
                    );
                }
                return (
                     <div className="space-y-4">
                        {groupedRecords && Object.entries(groupedRecords).sort(([a], [b]) => {
                             if (groupBy === 'class') {
                                return CLASS_ORDER.indexOf(a) - CLASS_ORDER.indexOf(b);
                            }
                            return a.localeCompare(b)
                        }).map(([groupName, memberRecords]: [string, typeof records]) => (
                            <details key={groupName} className="p-4 border border-gray-border rounded-lg bg-gray-base" open>
                                <summary className="font-bold cursor-pointer text-text-main">{groupName} ({memberRecords.length})</summary>
                                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {memberRecords.map(record => {
                                        const member = members.find(m => m.id === record.memberId);
                                        return (
                                        <UniformMemberCard 
                                            key={record.memberId}
                                            record={record}
                                            gender={member?.gender}
                                            canEdit={canEdit}
                                            onItemChange={handleItemChange}
                                            onSizeChange={handleSizeChange}
                                        />
                                    )})}
                                </div>
                            </details>
                        ))}
                    </div>
                );
            case 'pins':
                return <PinsAchievements achievements={achievements} members={members} onUpdate={handleAchievementUpdate} />;
            case 'order':
                 return <OrderSummary records={records} uniformData={uniformData} members={members} achievements={achievements} />;
            case 'other':
                return <OtherAchievements members={members} />;
            default: return null;
        }
    }
    
    const ViewToggleButton: React.FC<{ type: GroupBy, label: string }> = ({ type, label }) => (
        <Button
            size="sm"
            variant={groupBy === type ? 'secondary' : 'outline'}
            onClick={() => setGroupBy(type)}
            className={`!px-3 !py-1 ${groupBy !== type ? 'border-gray-border text-text-muted' : ''}`}
        >
            {label}
        </Button>
    );

    return (
        <>
            <div className="space-y-6">
                <Card>
                   <div className="flex flex-wrap justify-between items-center gap-4">
                        <div className="flex border-b border-gray-border">
                            {tabs.uniforms && <button onClick={() => setActiveTab('uniforms')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'uniforms' ? 'border-b-2 border-primary text-primary' : 'text-text-muted'}`}>Uniform Checklist</button>}
                            {tabs.pins && <button onClick={() => setActiveTab('pins')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'pins' ? 'border-b-2 border-primary text-primary' : 'text-text-muted'}`}>Pins & Chevrons</button>}
                            {tabs.otherAchievements && <button onClick={() => setActiveTab('other')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'other' ? 'border-b-2 border-primary text-primary' : 'text-text-muted'}`}>Other Achievements</button>}
                            {tabs.uniforms && <button onClick={() => setActiveTab('order')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'order' ? 'border-b-2 border-primary text-primary' : 'text-text-muted'}`}>Order Summary</button>}
                        </div>

                        <div className="flex items-center flex-wrap justify-end gap-2">
                            {activeTab === 'uniforms' && (
                                <div className="flex items-center gap-1 p-1 bg-gray-base rounded-lg border border-gray-border">
                                    <ViewToggleButton type="member" label="Member View" />
                                    <ViewToggleButton type="group" label="Group View" />
                                    <ViewToggleButton type="class" label="Class View" />
                                </div>
                            )}
                            <div className="flex gap-2">
                                {activeTab === 'uniforms' && <Button variant="outline" onClick={() => setIsPrintModalOpen(true)}>Print Checklist</Button>}
                                {activeTab === 'pins' && <Button variant="outline" onClick={() => setIsPinsPrintModalOpen(true)}>Print Checklist</Button>}
                                {activeTab !== 'other' && canEdit && <Button onClick={() => addAlert('Changes saved!', 'success')}>Save Changes</Button>}
                            </div>
                        </div>
                   </div>
                </Card>
                <Card>
                    {renderContent()}
                </Card>
            </div>
            <PrintUniformChecklistModal isOpen={isPrintModalOpen} onClose={() => setIsPrintModalOpen(false)} members={members} />
            <PrintPinsChecklistModal 
                isOpen={isPinsPrintModalOpen} 
                onClose={() => setIsPinsPrintModalOpen(false)} 
                members={members}
                achievements={achievements}
            />
        </>
    );
};

export default Uniform;