import * as React from 'react';
import { Honour, MemberHonourStatus, Member } from '../../types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { useUser, useAlert } from '../../App';
import { api } from '../../services/api';

interface HonourModalProps {
    isOpen: boolean;
    onClose: () => void;
    honour: Honour;
    status: MemberHonourStatus;
    members: Member[];
    onStatusChange: (memberId: string, honourId: string, status: 'Not Started' | 'In Progress' | 'Completed') => void;
}

const HonourModal: React.FC<HonourModalProps> = ({ isOpen, onClose, honour, members, status, onStatusChange }) => {
    const user = useUser();
    const { addAlert } = useAlert();
    const [searchTerm, setSearchTerm] = React.useState('');
    const [groupFilter, setGroupFilter] = React.useState('all');
    const [classFilter, setClassFilter] = React.useState('all');
    
    // State for bulk actions
    const [selectedMemberIds, setSelectedMemberIds] = React.useState<Set<string>>(new Set());
    const [bulkStatus, setBulkStatus] = React.useState<'Not Started' | 'In Progress' | 'Completed'>('Completed');
    // FIX: Add a ref to manage the indeterminate state of the 'select all' checkbox.
    const selectAllCheckboxRef = React.useRef<HTMLInputElement>(null);


    const uniqueGroups = React.useMemo(() => ['all', ...new Set(members.map(m => m.group))], [members]);
    const uniqueClasses = React.useMemo(() => ['all', ...new Set(members.map(m => m.class))], [members]);
    
    const filteredMembers = React.useMemo(() => {
        return members.filter(m => 
            m.fullName.toLowerCase().includes(searchTerm.toLowerCase()) &&
            (groupFilter === 'all' || m.group === groupFilter) &&
            (classFilter === 'all' || m.class === classFilter)
        );
    }, [members, searchTerm, groupFilter, classFilter]);
    
    React.useEffect(() => {
        if (!isOpen) {
            setSearchTerm('');
            setGroupFilter('all');
            setClassFilter('all');
            setSelectedMemberIds(new Set());
        }
    }, [isOpen]);
    
    // FIX: Set indeterminate state on the 'select all' checkbox via a ref and useEffect.
    React.useEffect(() => {
        if (selectAllCheckboxRef.current) {
            const numSelected = selectedMemberIds.size;
            const numVisible = filteredMembers.length;
            selectAllCheckboxRef.current.indeterminate = numSelected > 0 && numSelected < numVisible;
        }
    }, [selectedMemberIds, filteredMembers]);

    const handleStatusChange = (memberId: string, honourId: string, newStatus: 'Not Started' | 'In Progress' | 'Completed') => {
        if (user) {
            const memberName = members.find(m => m.id === memberId)?.fullName || 'Unknown Member';
            const userName = user.individualName ? `${user.individualName} (${user.name})` : user.name;
            api.logAction(userName, 'Update Honour Status', `Set status for ${memberName} on honour '${honour.name}' to ${newStatus}`);
        }
        onStatusChange(memberId, honourId, newStatus);
    };
    
    // --- BULK ACTIONS ---
    const handleToggleAll = () => {
        const allVisibleIds = new Set(filteredMembers.map(m => m.id));
        if (selectedMemberIds.size === allVisibleIds.size) {
            setSelectedMemberIds(new Set());
        } else {
            setSelectedMemberIds(allVisibleIds);
        }
    };
    
    const handleToggleMember = (memberId: string) => {
        const newSelection = new Set(selectedMemberIds);
        if (newSelection.has(memberId)) {
            newSelection.delete(memberId);
        } else {
            newSelection.add(memberId);
        }
        setSelectedMemberIds(newSelection);
    };
    
    const handleApplyBulkStatus = () => {
        if (!user || selectedMemberIds.size === 0) return;

        const userName = user.individualName ? `${user.individualName} (${user.name})` : user.name;
        
        selectedMemberIds.forEach(memberId => {
            // Note: This calls the individual log action. For a high-performance backend, you'd want a single bulk API call.
            handleStatusChange(memberId, honour.id, bulkStatus);
        });

        // Add a single summary log for the bulk action itself
        api.logAction(userName, 'Bulk Update Honour Status', `Set status for ${selectedMemberIds.size} members on honour '${honour.name}' to ${bulkStatus}`);
        
        addAlert(`Updated status for ${selectedMemberIds.size} members.`, 'success');
        setSelectedMemberIds(new Set());
    };
    // --- END BULK ACTIONS ---

    const inputStyles = "bg-gray-base border-gray-border rounded-md text-sm p-1.5 focus:ring-primary focus:border-primary placeholder:text-text-muted";
    const selectStyles = "bg-gray-base border-gray-border rounded-md text-sm p-1.5 focus:ring-primary focus:border-primary";

    return (
        <Modal show={isOpen} onClose={onClose} title={`${honour.name} - Status`} size="lg">
            <div className="flex items-start gap-6">
                <img src={honour.patchUrl} alt={honour.name} className="w-32 h-32 rounded-lg border-4 border-gray-border bg-gray-border flex-shrink-0" />
                <div>
                    <h3 className="text-2xl font-bold">{honour.name}</h3>
                    <p className="text-text-muted">{honour.category} - Level {honour.level}</p>
                    {honour.instructor && <p className="text-sm text-text-subtle mt-1">Instructor: {honour.instructor}</p>}
                </div>
            </div>
            <div className="mt-6">
                <div className="flex flex-wrap justify-between items-center mb-2 gap-2">
                    <h4 className="font-bold">Member Progress</h4>
                     <div className="flex gap-2">
                        <input type="text" placeholder="Filter members..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className={inputStyles} />
                        <select value={groupFilter} onChange={e => setGroupFilter(e.target.value)} className={selectStyles}>
                            {uniqueGroups.map(g => <option key={g} value={g}>{g === 'all' ? 'All Groups' : g}</option>)}
                        </select>
                        <select value={classFilter} onChange={e => setClassFilter(e.target.value)} className={selectStyles}>
                            {uniqueClasses.map(c => <option key={c} value={c}>{c === 'all' ? 'All Classes' : c}</option>)}
                        </select>
                    </div>
                </div>

                {selectedMemberIds.size > 0 && (
                    <div className="flex items-center gap-3 p-2 my-2 bg-primary/10 border border-primary/20 rounded-md">
                        <span className="text-sm font-semibold text-primary">{selectedMemberIds.size} selected</span>
                        <select
                            value={bulkStatus}
                            onChange={e => setBulkStatus(e.target.value as any)}
                            className={selectStyles}
                        >
                            <option value="Not Started">Set to: Not Started</option>
                            <option value="In Progress">Set to: In Progress</option>
                            <option value="Completed">Set to: Completed</option>
                        </select>
                        <Button size="sm" onClick={handleApplyBulkStatus}>Apply to Selected</Button>
                    </div>
                )}

                <div className="overflow-y-auto max-h-80 pr-2 border border-gray-border rounded-lg">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-base text-left sticky top-0">
                            <tr>
                                <th className="p-2 w-4">
                                    <input
                                        ref={selectAllCheckboxRef}
                                        type="checkbox"
                                        className="h-4 w-4 rounded text-primary bg-gray-input border-gray-border focus:ring-primary"
                                        onChange={handleToggleAll}
                                        checked={filteredMembers.length > 0 && selectedMemberIds.size === filteredMembers.length}
                                        title="Select/Deselect All Visible"
                                    />
                                </th>
                                <th className="p-2 font-medium text-text-muted">Member</th>
                                <th className="p-2 font-medium text-text-muted">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                        {filteredMembers.sort((a,b) => a.fullName.localeCompare(b.fullName)).map(member => (
                            <tr key={member.id} className={`border-b border-gray-border last:border-b-0 ${selectedMemberIds.has(member.id) ? 'bg-primary/5' : ''}`}>
                                <td className="p-2">
                                     <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded text-primary bg-gray-input border-gray-border focus:ring-primary"
                                        checked={selectedMemberIds.has(member.id)}
                                        onChange={() => handleToggleMember(member.id)}
                                    />
                                </td>
                                <td className="p-2 font-medium text-text-main">{member.fullName}</td>
                                <td className="p-2">
                                     <select
                                        value={status[member.id]?.[honour.id] || 'Not Started'}
                                        onChange={(e) => handleStatusChange(member.id, honour.id, e.target.value as any)}
                                        className={`text-sm rounded border-gray-border bg-gray-input focus:ring-primary focus:border-primary`}
                                    >
                                        <option value="Not Started">Not Started</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Completed">Completed</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="mt-6 flex justify-end">
                <Button onClick={onClose}>Close</Button>
            </div>
        </Modal>
    );
};

export default HonourModal;
