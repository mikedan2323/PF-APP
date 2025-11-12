// FIX: Import React as a namespace to fix JSX type errors.
import * as React from 'react';
import Button from '../ui/Button';
import { api } from '../../services/api';
import { Edit, Trash2 } from 'react-feather';
import { useAlert, useUser } from '../../App';
import { Group } from '../../types';
import GroupModal from '../modals/GroupModal';
import ConfirmationModal from '../modals/ConfirmationModal';

const DEFAULT_GROUPS = ['Lions', 'Eagles', 'Bears', 'Wolves'];

const GroupManagement: React.FC = () => {
    const user = useUser();
    const [groups, setGroups] = React.useState<Group[]>([]);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [groupToEdit, setGroupToEdit] = React.useState<Group | null>(null);
    const [groupToDelete, setGroupToDelete] = React.useState<Group | null>(null);
    const { addAlert } = useAlert();

    const fetchGroups = () => {
        api.getGroups().then(res => res.success && setGroups(res.data));
    };

    React.useEffect(() => {
        fetchGroups();
    }, []);

    const handleOpenModal = (group: Group | null = null) => {
        setGroupToEdit(group);
        setIsModalOpen(true);
    };

    const handleSaveGroup = async (groupData: { name: string, color: string }) => {
        if(groupToEdit) { // Editing existing group
             await api.updateGroup(groupToEdit.name, groupData.name, groupData.color);
             addAlert(`Group "${groupData.name}" updated.`, 'success');
             if (user) api.logAction(user.name, 'Update Group', `Updated group: ${groupData.name}`);
        } else { // Adding new group
            if (groups.some(g => g.name === groupData.name)) {
                addAlert(`Group "${groupData.name}" already exists.`, 'error');
                return;
            }
            await api.addGroup(groupData.name, groupData.color);
            addAlert(`Group "${groupData.name}" added.`, 'success');
            if (user) api.logAction(user.name, 'Add Group', `Created new group: ${groupData.name}`);
        }
        fetchGroups();
        setIsModalOpen(false);
    };
    
    const handleDelete = async () => {
        if(!groupToDelete) return;

        await api.deleteGroup(groupToDelete.name);
        addAlert(`Group "${groupToDelete.name}" deleted. Any members in this group will be moved to "Unassigned".`, 'success');
        if (user) api.logAction(user.name, 'Delete Group', `Deleted group: ${groupToDelete.name}`);
        
        fetchGroups();
        setGroupToDelete(null);
    }
    
    const handleInitiateDelete = () => {
        if (!groupToEdit) return;
        setIsModalOpen(false);
        setGroupToDelete(groupToEdit);
    };

    return (
        <>
            <div className="space-y-6">
                <div className="flex justify-between items-center mb-6">
                    <p className="text-text-muted">Manage the groups/teams within the club, including their assigned colors.</p>
                    <Button onClick={() => handleOpenModal()}>Add Custom Group</Button>
                </div>
                <div className="overflow-x-auto -m-6">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-base text-left">
                            <tr>
                                <th className="p-3 font-medium text-text-muted">Group Name</th>
                                <th className="p-3 font-medium text-text-muted">Color</th>
                                <th className="p-3 font-medium text-text-muted">Type</th>
                                <th className="p-3 font-medium text-text-muted">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {groups.map(group => (
                                <tr key={group.name} className="border-b border-gray-border">
                                    <td className="p-3 font-semibold">{group.name}</td>
                                    <td className="p-3">
                                        <div className="flex items-center">
                                            <span className="w-5 h-5 rounded-full border border-gray-border" style={{ backgroundColor: group.color }}></span>
                                            <span className="ml-2 text-text-subtle">{group.color}</span>
                                        </div>
                                    </td>
                                    <td className="p-3">
                                        {DEFAULT_GROUPS.includes(group.name) 
                                            ? <span className="text-xs px-2 py-1 bg-gray-light-border text-text-muted rounded-full">Default</span>
                                            : <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded-full">Custom</span>
                                        }
                                    </td>
                                    <td className="p-3">
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="outline" onClick={() => handleOpenModal(group)}><Edit size={14} className="mr-1"/> Edit</Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <GroupModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveGroup}
                group={groupToEdit}
                onDelete={handleInitiateDelete}
                isDefault={!!groupToEdit && DEFAULT_GROUPS.includes(groupToEdit.name)}
            />
            <ConfirmationModal
                isOpen={!!groupToDelete}
                onClose={() => setGroupToDelete(null)}
                onConfirm={handleDelete}
                title="Delete Group"
                message={`Are you sure you want to delete "${groupToDelete?.name}"? Any members in this group will be moved to "Unassigned".`}
            />
        </>
    );
};

export default GroupManagement;