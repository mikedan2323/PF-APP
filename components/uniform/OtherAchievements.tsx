import * as React from 'react';
import { Member, MemberOtherAchievement, OtherAchievementType } from '../../types';
import { api } from '../../services/api';
import Spinner from '../ui/Spinner';
import Button from '../ui/Button';
import { useUser, useAlert } from '../../App';
import { Plus, Edit, Trash2, CheckCircle, XCircle } from 'react-feather';
import AddOtherAchievementModal from '../modals/AddOtherAchievementModal';
import ConfirmationModal from '../modals/ConfirmationModal';

interface OtherAchievementsProps {
    members: Member[];
}

const CLASS_ORDER = ['Friend', 'Companion', 'Explorer', 'Ranger', 'Voyager', 'Guide'];
type GroupBy = 'member' | 'group' | 'class';

const OtherAchievements: React.FC<OtherAchievementsProps> = ({ members }) => {
    const user = useUser();
    const { addAlert } = useAlert();
    const [loading, setLoading] = React.useState(true);
    const [records, setRecords] = React.useState<MemberOtherAchievement[]>([]);
    const [achievementTypes, setAchievementTypes] = React.useState<OtherAchievementType[]>([]);
    
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [memberToUpdate, setMemberToUpdate] = React.useState<Member | null>(null);
    const [achievementToEdit, setAchievementToEdit] = React.useState<MemberOtherAchievement | null>(null);
    const [achievementToDelete, setAchievementToDelete] = React.useState<MemberOtherAchievement | null>(null);
    
    const [searchTerm, setSearchTerm] = React.useState('');
    const [groupBy, setGroupBy] = React.useState<GroupBy>('member');


    const fetchData = async () => {
        setLoading(true);
        const res = await api.getOtherAchievementData();
        if (res.success) {
            setRecords(res.data.records);
            setAchievementTypes(res.data.types);
        }
        setLoading(false);
    };

    React.useEffect(() => {
        fetchData();
    }, []);
    
    const handleOpenAddModal = (member: Member) => {
        setMemberToUpdate(member);
        setAchievementToEdit(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (achievement: MemberOtherAchievement) => {
        const member = members.find(m => m.id === achievement.memberId);
        if (member) {
            setMemberToUpdate(member);
            setAchievementToEdit(achievement);
            setIsModalOpen(true);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setMemberToUpdate(null);
        setAchievementToEdit(null);
    };
    
    const handleSave = () => {
        addAlert('Achievement saved successfully!', 'success');
        fetchData();
        handleCloseModal();
    }
    
    const handleDelete = async () => {
        if (!achievementToDelete) return;
        setLoading(true);
        await api.deleteOtherAchievement(achievementToDelete.id);
        setLoading(false);
        addAlert('Achievement record deleted.', 'success');
        fetchData();
        setAchievementToDelete(null);
    };

    const memberAchievements = React.useMemo(() => {
        const filteredMembers = members.filter(member => 
            member.fullName.toLowerCase().includes(searchTerm.toLowerCase())
        );
        return filteredMembers.map(member => ({
            ...member,
            achievements: records.filter(r => r.memberId === member.id)
        }));
    }, [members, records, searchTerm]);

    const groupedData = React.useMemo(() => {
        if (groupBy === 'member') return null;
        return memberAchievements.reduce((acc, member) => {
            const key = member[groupBy];
            if (!acc[key]) acc[key] = [];
            acc[key].push(member);
            return acc;
        }, {} as Record<string, typeof memberAchievements>);
    }, [memberAchievements, groupBy]);


    if (loading || !user) return <Spinner show={true} />;
    
    const canEdit = user.permissions.uniform.canEditOtherAchievements;
    
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

    const MemberAchievementRow: React.FC<{ member: (typeof memberAchievements)[0] }> = ({ member }) => (
        <tr key={member.id} className="border-b border-gray-border">
            <td className="p-3 font-semibold text-text-main align-top">{member.fullName}</td>
            <td className="p-3 align-top">
                {member.achievements.length > 0 ? (
                    <ul className="space-y-2">
                        {member.achievements.map(ach => (
                            <li key={ach.id} className="flex items-center justify-between text-xs p-2 bg-gray-base rounded-md">
                                <div>
                                    <span className="font-semibold text-text-main">{ach.achievement}</span>
                                    <span className="text-text-muted"> ({ach.type}) - {ach.dateEarned}</span>
                                    {ach.notes && <p className="text-text-subtle italic">"{ach.notes}"</p>}
                                </div>
                                <div className="flex items-center gap-4">
                                    {ach.received 
                                        ? <span className="flex items-center gap-1 text-primary"><CheckCircle size={14} /> Received</span>
                                        : <span className="flex items-center gap-1 text-text-subtle"><XCircle size={14} /> Not Received</span>
                                    }
                                    {canEdit && (
                                        <div className="flex gap-1">
                                            <Button size="sm" variant="outline" className="!p-1.5" onClick={() => handleOpenEditModal(ach)}><Edit size={12} /></Button>
                                            <Button size="sm" variant="danger" className="!p-1.5" onClick={() => setAchievementToDelete(ach)}><Trash2 size={12} /></Button>
                                        </div>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-xs text-text-muted">No achievements recorded.</p>
                )}
            </td>
            {canEdit && (
                <td className="p-3 align-top">
                    <Button size="sm" onClick={() => handleOpenAddModal(member)}>
                        <Plus size={14} className="mr-1" /> Add
                    </Button>
                </td>
            )}
        </tr>
    );

    return (
        <>
            <div className="space-y-4">
                 <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                    <input
                        type="text"
                        placeholder="Search by name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full md:w-64 px-3 py-2 bg-gray-input border border-gray-border rounded-md text-sm focus:ring-primary focus:border-primary placeholder:text-text-muted"
                    />
                    <div className="flex items-center gap-1 p-1 bg-gray-base rounded-lg border border-gray-border">
                        <ViewToggleButton type="member" label="Member View" />
                        <ViewToggleButton type="group" label="Group View" />
                        <ViewToggleButton type="class" label="Class View" />
                    </div>
                </div>
                <div className="overflow-x-auto -mx-6">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-base text-left">
                            <tr>
                                <th className="p-3 font-medium text-text-muted">Member</th>
                                <th className="p-3 font-medium text-text-muted">Achievements Earned</th>
                                {canEdit && <th className="p-3 font-medium text-text-muted">Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {groupBy === 'member' ? (
                                memberAchievements.map(member => <MemberAchievementRow key={member.id} member={member} />)
                            ) : (
                                groupedData && Object.entries(groupedData)
                                    .sort(([a], [b]) => {
                                        if (groupBy === 'class') return CLASS_ORDER.indexOf(a) - CLASS_ORDER.indexOf(b);
                                        return a.localeCompare(b);
                                    })
                                    .map(([groupName, membersInGroup]: [string, (Member & { achievements: MemberOtherAchievement[] })[]]) => (
                                        <React.Fragment key={groupName}>
                                            <tr className="bg-gray-base sticky top-0">
                                                <td colSpan={canEdit ? 3 : 2} className="p-2 font-bold text-text-main border-b border-t border-gray-border">
                                                    {groupName} ({membersInGroup.length})
                                                </td>
                                            </tr>
                                            {membersInGroup.map(member => <MemberAchievementRow key={member.id} member={member} />)}
                                        </React.Fragment>
                                    ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {isModalOpen && memberToUpdate && (
                <AddOtherAchievementModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSave={handleSave}
                    member={memberToUpdate}
                    achievementTypes={achievementTypes}
                    achievementToEdit={achievementToEdit}
                />
            )}
            <ConfirmationModal
                isOpen={!!achievementToDelete}
                onClose={() => setAchievementToDelete(null)}
                onConfirm={handleDelete}
                title="Delete Achievement Record"
                message={`Are you sure you want to delete the "${achievementToDelete?.achievement}" record for this member?`}
            />
        </>
    );
}

export default OtherAchievements;
