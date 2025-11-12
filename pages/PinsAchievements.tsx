// Implemented the PinsAchievements component for the Uniform page to resolve module resolution errors.
import * as React from 'react';
import { Member, MemberAchievements } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useUser, useAlert } from '../App';
import { Check, X } from 'react-feather';
import AchievementDetailModal from '../components/modals/AchievementDetailModal';

const CLASS_PROGRESSION = ['Friend', 'Companion', 'Explorer', 'Ranger', 'Voyager', 'Guide'];
type GroupBy = 'member' | 'group' | 'class';

interface PinsAchievementsProps {
    achievements: MemberAchievements[];
    members: Member[];
    onUpdate: (memberId: string, achievement: string, type: 'earned' | 'received', value: boolean) => void;
}

const PinsAchievements: React.FC<PinsAchievementsProps> = ({ achievements, members, onUpdate }) => {
    const user = useUser();
    const { addAlert } = useAlert();
    const [selectedMember, setSelectedMember] = React.useState<MemberAchievements & { memberClass: string } | null>(null);
    const [groupBy, setGroupBy] = React.useState<GroupBy>('member');
    
    const handleOpenDetails = (achievementRecord: MemberAchievements) => {
        const memberDetails = members.find(m => m.id === achievementRecord.memberId);
        if(memberDetails) {
            setSelectedMember({
                ...achievementRecord,
                memberClass: memberDetails.class,
            });
        } else {
            addAlert("Could not find member details.", "error");
        }
    };
    
    const groupedAchievements = React.useMemo(() => {
        if (groupBy === 'member') return null;
        
        const memberMap = new Map(members.map(m => [m.id, m]));
        
        return achievements.reduce((acc, achievement) => {
            const member = memberMap.get(achievement.memberId);
            if (!member) return acc;
            
            const key = member[groupBy];
            if (!acc[key]) acc[key] = [];
            
            acc[key].push(achievement);
            return acc;
        }, {} as Record<string, typeof achievements>);
    }, [achievements, members, groupBy]);


    if (!user) return null;

    const { permissions } = user;
    const canEdit = permissions.uniform.canEditPins;
    
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
    
    const MemberRow: React.FC<{member: MemberAchievements}> = ({member}) => (
        <tr key={member.memberId} className="border-b border-gray-border">
            <td className="p-3 font-semibold text-text-main">{member.name}</td>
            {CLASS_PROGRESSION.map(className => {
                const pinStatus = member.achievements[`${className} Pin`] || { earned: false, received: false };
                const chevronStatus = member.achievements[`${className} Chevron`] || { earned: false, received: false };
                const isEarned = pinStatus.earned; // Shared status
                return (
                    <React.Fragment key={className}>
                        <td className="p-3 text-center border-l border-gray-border">
                            {isEarned ? <Check size={16} className="text-success mx-auto" /> : <X size={16} className="text-text-subtle mx-auto" />}
                        </td>
                        <td className="p-3 text-center">
                            {pinStatus.received ? <Check size={16} className="text-primary mx-auto" /> : <X size={16} className="text-text-subtle mx-auto" />}
                        </td>
                         <td className="p-3 text-center">
                            {chevronStatus.received ? <Check size={16} className="text-primary mx-auto" /> : <X size={16} className="text-text-subtle mx-auto" />}
                        </td>
                    </React.Fragment>
                );
            })}
            <td className="p-3 border-l border-gray-border">
                {canEdit && 
                    <Button size="sm" variant="outline" onClick={() => handleOpenDetails(member)}>
                        Details
                    </Button>
                }
            </td>
        </tr>
    );

    return (
        <>
            <div className="space-y-6">
                <Card title="Pins & Chevrons Checklist" actions={
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 p-1 bg-gray-base rounded-lg border border-gray-border">
                            <ViewToggleButton type="member" label="Member View" />
                            <ViewToggleButton type="group" label="Group View" />
                            <ViewToggleButton type="class" label="Class View" />
                        </div>
                    </div>
                }>
                    <div className="overflow-auto -mx-4 md:-mx-6 max-h-[70vh]">
                        <table className="w-full text-sm">
                            <thead className="text-left bg-gray-surface align-bottom sticky top-0 z-10">
                                <tr>
                                    <th rowSpan={2} className="p-3 font-medium text-text-muted border-b border-gray-border">Member</th>
                                    {CLASS_PROGRESSION.map(className => (
                                        <th key={className} colSpan={3} className="p-3 font-medium text-text-muted text-center border-b border-l border-gray-border">
                                            {className}
                                        </th>
                                    ))}
                                    <th rowSpan={2} className="p-3 font-medium text-text-muted border-b border-l border-gray-border">Actions</th>
                                </tr>
                                <tr>
                                    {CLASS_PROGRESSION.flatMap(className => ([
                                        <th key={`${className}-earned`} className="p-2 font-normal text-text-subtle text-center border-b border-l border-gray-border">Earned</th>,
                                        <th key={`${className}-pin-rec`} className="p-2 font-normal text-text-subtle text-center border-b border-gray-border">Pin Rec'd</th>,
                                        <th key={`${className}-chevron-rec`} className="p-2 font-normal text-text-subtle text-center border-b border-gray-border">Chevron Rec'd</th>
                                    ]))}
                                </tr>
                            </thead>
                            <tbody>
                                {groupBy === 'member' ? (
                                    achievements.map(member => <MemberRow key={member.memberId} member={member} />)
                                ) : (
                                    groupedAchievements && Object.entries(groupedAchievements)
                                        .sort(([a], [b]) => {
                                            if (groupBy === 'class') {
                                                return CLASS_PROGRESSION.indexOf(a) - CLASS_PROGRESSION.indexOf(b);
                                            }
                                            return a.localeCompare(b);
                                        })
                                        .flatMap(([groupName, memberAchievements]: [string, MemberAchievements[]]) => ([
                                        <tr key={groupName} className="bg-gray-base sticky top-[85px] z-[5]">
                                            <td colSpan={20} className="p-2 font-bold text-text-main border-b border-t border-gray-border">{groupName}</td>
                                        </tr>,
                                        ...memberAchievements.map(member => <MemberRow key={member.memberId} member={member} />)
                                    ]))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            {selectedMember && (
                <AchievementDetailModal
                    isOpen={!!selectedMember}
                    onClose={() => setSelectedMember(null)}
                    member={selectedMember}
                    onUpdate={onUpdate}
                />
            )}
        </>
    );
};

export default PinsAchievements;