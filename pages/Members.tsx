// FIX: Import React as a namespace to fix JSX type errors.
import * as React from 'react';
import { api } from '../services/api';
import { Member, Group } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import MemberModal from '../components/modals/MemberModal';
import { useAlert, useUser } from '../App';
import { Plus, Download, Check, X, Trash2, MoreVertical, XCircle } from 'react-feather';
import GroupManagement from '../components/members/GroupManagement';
import AccessDenied from '../components/ui/AccessDenied';
import ConfirmationModal from '../components/modals/ConfirmationModal';
import moment from 'moment';
import BulkUpdateModal from '../components/modals/BulkUpdateModal';


const Members: React.FC = () => {
    const user = useUser();
    const [members, setMembers] = React.useState<Member[]>([]);
    const [groups, setGroups] = React.useState<Group[]>([]);
    const [classes, setClasses] = React.useState<string[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [selectedMember, setSelectedMember] = React.useState<Member | null>(null);
    const [memberToDelete, setMemberToDelete] = React.useState<Member | null>(null);
    const { addAlert } = useAlert();
    const [activeTab, setActiveTab] = React.useState('directory');
    const bulkActionsRef = React.useRef<HTMLDivElement>(null);
    // FIX: Add a ref to manage the indeterminate state of the 'select all' checkbox.
    const selectAllCheckboxRef = React.useRef<HTMLInputElement>(null);

    // Filters
    const [searchTerm, setSearchTerm] = React.useState('');
    const [groupFilter, setGroupFilter] = React.useState('all');
    const [classFilter, setClassFilter] = React.useState('all');
    const [statusFilter, setStatusFilter] = React.useState('all');

    // Bulk Actions State
    const [selectedMemberIds, setSelectedMemberIds] = React.useState<Set<string>>(new Set());
    const [isBulkActionsOpen, setIsBulkActionsOpen] = React.useState(false);
    const [isBulkUpdateModalOpen, setIsBulkUpdateModalOpen] = React.useState(false);
    const [bulkUpdateConfig, setBulkUpdateConfig] = React.useState<{ action: 'group' | 'class' | 'status', title: string, label: string, options: string[] } | null>(null);
    const [confirmationConfig, setConfirmationConfig] = React.useState<{ title: string, message: string, onConfirm: () => void } | null>(null);


    const fetchData = async () => {
        setLoading(true);
        const response = await api.getMembersData();
        if (response.success) {
            setMembers(response.data.members);
            setGroups(response.data.groups);
            setClasses(response.data.classes);
        }
        setLoading(false);
    };

    React.useEffect(() => {
        fetchData();
    }, []);
    
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (bulkActionsRef.current && !bulkActionsRef.current.contains(event.target as Node)) {
                setIsBulkActionsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleOpenModal = (member: Member | null = null) => {
        setSelectedMember(member);
        setIsModalOpen(true);
    };
    
    const handleSaveMember = async (member: Member) => {
        const userName = user?.individualName ? `${user.individualName} (${user.name})` : user?.name || 'Unknown';
        setLoading(true);
        if (selectedMember) {
             const res = await api.updateMember(member);
             if (res.success) {
                addAlert('Member updated successfully!', 'success');
                api.logAction(userName, 'Edit Member', `Edited member: ${member.fullName}`);
             } else {
                // FIX: Correctly access the message property from the API response on failure.
                // The current API implementation does not return a message on failure, so a generic one is used.
                addAlert('Failed to update member', 'error');
             }
        } else {
            const res = await api.addMember(member);
            if (res.success) {
                addAlert('Member added successfully!', 'success');
                api.logAction(userName, 'Add Member', `Added member: ${member.fullName}`);
            } else {
                // FIX: Provide a generic error message as the addMember API doesn't return a specific one on failure.
                addAlert('Failed to add member', 'error');
            }
        }
        setIsModalOpen(false);
        await fetchData();
    };

    const handleSaveMultipleMembers = (newMembers: Member[]) => {
        newMembers.forEach(member => api.addMember(member));
        addAlert(`${newMembers.length} members added successfully!`, 'success');
        const userName = user?.individualName ? `${user.individualName} (${user.name})` : user?.name || 'Unknown';
        api.logAction(userName, 'Bulk Add Members', `Added ${newMembers.length} new members.`);
        setIsModalOpen(false);
        fetchData();
    }

    const handleDeleteMember = async () => {
        if (!memberToDelete || !user) return;
        setLoading(true);
        const res = await api.deleteMember(memberToDelete.id);
        if (res.success) {
            addAlert(`Member '${memberToDelete.fullName}' deleted successfully.`, 'success');
            const userName = user.individualName ? `${user.individualName} (${user.name})` : user.name;
            api.logAction(userName, 'Delete Member', `Deleted member: ${memberToDelete.fullName} (ID: ${memberToDelete.id})`);
            fetchData();
        } else if('message' in res) {
            addAlert(res.message, 'error');
        }
        setMemberToDelete(null);
        setLoading(false);
    };

    const calculateAge = (dob?: string): string => {
        if (!dob) return 'N/A';
        return moment().diff(moment(dob), 'years').toString();
    };
    
    const groupColorMap = React.useMemo(() => new Map(groups.map(g => [g.name, g.color])), [groups]);


    const filteredMembers = React.useMemo(() => {
        return members.filter(member => {
            return (
                member.fullName.toLowerCase().includes(searchTerm.toLowerCase()) &&
                (groupFilter === 'all' || member.group === groupFilter) &&
                (classFilter === 'all' || member.class === classFilter) &&
                (statusFilter === 'all' || member.status === statusFilter)
            );
        });
    }, [members, searchTerm, groupFilter, classFilter, statusFilter]);
    
    // --- BULK ACTIONS ---
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedMemberIds(new Set(filteredMembers.map(m => m.id)));
        } else {
            setSelectedMemberIds(new Set());
        }
    };
    
    // FIX: Set indeterminate state on the 'select all' checkbox via a ref and useEffect.
    React.useEffect(() => {
        if (selectAllCheckboxRef.current) {
            const numSelected = selectedMemberIds.size;
            const numVisible = filteredMembers.length;
            selectAllCheckboxRef.current.indeterminate = numSelected > 0 && numSelected < numVisible;
        }
    }, [selectedMemberIds, filteredMembers]);


    const handleSelectOne = (memberId: string) => {
        const newSelection = new Set(selectedMemberIds);
        if (newSelection.has(memberId)) {
            newSelection.delete(memberId);
        } else {
            newSelection.add(memberId);
        }
        setSelectedMemberIds(newSelection);
    };
    
    const handleBulkUpdateField = (value: string) => {
        if (!bulkUpdateConfig || !user) return;
        setLoading(true);
        // FIX: Explicitly cast the result of Array.from to string[] to satisfy the API signature.
        const memberIds: string[] = Array.from(selectedMemberIds);
        api.bulkUpdateField(memberIds, bulkUpdateConfig.action, value).then(() => {
            addAlert(`Updated ${bulkUpdateConfig.action} for ${memberIds.length} members.`, 'success');
            const userName = user.individualName ? `${user.individualName} (${user.name})` : user.name;
            api.logAction(userName, `Bulk Change ${bulkUpdateConfig.action}`, `Set ${bulkUpdateConfig.action} to "${value}" for ${memberIds.length} members.`);
            fetchData();
            setSelectedMemberIds(new Set());
            setIsBulkUpdateModalOpen(false);
        });
    };

    const handleBulkRegistrationUpdate = async (field: keyof Member['registration'], value: boolean) => {
        if (!user) return;
        setLoading(true);
        // FIX: Explicitly cast the result of Array.from to string[] to satisfy the API signature.
        const memberIds: string[] = Array.from(selectedMemberIds);
        await api.bulkUpdateRegistration(memberIds, field, value);
        addAlert(`Updated registration status for ${memberIds.length} members.`, 'success');
        const userName = user.individualName ? `${user.individualName} (${user.name})` : user.name;
        api.logAction(userName, `Bulk Update Registration`, `Set ${field} to ${value} for ${memberIds.length} members.`);
        fetchData();
        setSelectedMemberIds(new Set());
        setConfirmationConfig(null);
    };

    const handleBulkDelete = async () => {
        if (!user) return;
        setLoading(true);
        // FIX: Explicitly cast the result of Array.from to string[] to satisfy the API signature.
        const memberIds: string[] = Array.from(selectedMemberIds);
        await api.bulkDeleteMembers(memberIds);
        addAlert(`Deleted ${memberIds.length} members.`, 'success');
        const userName = user.individualName ? `${user.individualName} (${user.name})` : user.name;
        api.logAction(userName, 'Bulk Delete Members', `Deleted ${memberIds.length} members.`);
        fetchData();
        setSelectedMemberIds(new Set());
        setConfirmationConfig(null);
    };

    const openBulkUpdateModal = (action: 'group' | 'class' | 'status') => {
        let config;
        switch (action) {
            case 'group':
                config = { action, title: 'Move Members to Group', label: 'Select New Group', options: groups.map(g => g.name) };
                break;
            case 'class':
                config = { action, title: 'Change Member Class', label: 'Select New Class', options: classes };
                break;
            case 'status':
                config = { action, title: 'Change Member Status', label: 'Select New Status', options: ['Active', 'Inactive'] };
                break;
        }
        setBulkUpdateConfig(config);
        setIsBulkUpdateModalOpen(true);
        setIsBulkActionsOpen(false);
    };
    
    const openConfirmation = (action: 'delete' | 'regFormTrue' | 'regFormFalse' | 'healthTrue' | 'healthFalse' | 'feesTrue' | 'feesFalse') => {
        const size = selectedMemberIds.size;
        let config;
        switch (action) {
            case 'delete':
                config = { title: 'Delete Members', message: `Are you sure you want to permanently delete ${size} members?`, onConfirm: handleBulkDelete };
                break;
            case 'regFormTrue':
                config = { title: 'Mark Registration Completed', message: `Mark registration form as completed for ${size} members?`, onConfirm: () => handleBulkRegistrationUpdate('form', true) };
                break;
            case 'regFormFalse':
                config = { title: 'Unmark Registration Completed', message: `Mark registration form as incomplete for ${size} members?`, onConfirm: () => handleBulkRegistrationUpdate('form', false) };
                break;
            case 'healthTrue':
                config = { title: 'Mark Health Info Provided', message: `Mark health info as provided for ${size} members?`, onConfirm: () => handleBulkRegistrationUpdate('healthInfo', true) };
                break;
            case 'healthFalse':
                config = { title: 'Unmark Health Info Provided', message: `Mark health info as not provided for ${size} members?`, onConfirm: () => handleBulkRegistrationUpdate('healthInfo', false) };
                break;
            case 'feesTrue':
                config = { title: 'Mark Fees Paid', message: `Mark fees as paid for ${size} members?`, onConfirm: () => handleBulkRegistrationUpdate('feesPaid', true) };
                break;
            case 'feesFalse':
                config = { title: 'Unmark Fees Paid', message: `Mark fees as unpaid for ${size} members?`, onConfirm: () => handleBulkRegistrationUpdate('feesPaid', false) };
                break;
        }
        setConfirmationConfig(config);
        setIsBulkActionsOpen(false);
    };

    // --- END BULK ACTIONS ---

    if (loading || !user) return <Spinner show={true} />;
    
    const { permissions } = user;

    if (!permissions.members.view) {
        return <AccessDenied />;
    }
    
    const Checkmark: React.FC<{ value: boolean }> = ({ value }) => (
        value ? <Check size={18} className="text-success mx-auto" /> : <X size={18} className="text-text-subtle mx-auto" />
    );

    const inputStyles = "w-full px-3 py-2 bg-gray-input border border-gray-border rounded-md text-sm focus:ring-primary focus:border-primary placeholder:text-text-muted";
    const selectStyles = "w-full px-3 py-2 bg-gray-input border border-gray-border rounded-md text-sm focus:ring-primary focus:border-primary";
    
    // FIX: Changed icon prop type to React.ReactElement<any> to allow cloning with additional props like 'size'.
    const BulkActionMenuItem: React.FC<{ onClick: () => void, children: React.ReactNode, icon?: React.ReactElement<any> }> = ({ onClick, children, icon }) => (
        <button onClick={onClick} className="flex items-center w-full text-left px-3 py-1.5 text-sm text-text-main hover:bg-gray-base rounded-md">
            {icon && React.cloneElement(icon, { size: 16, className: "mr-2 text-text-subtle" })}
            {children}
        </button>
    );

    return (
        <>
            <div className="space-y-6">
                <Card>
                   <div className="flex flex-wrap justify-between items-center gap-4">
                     <div className="flex border-b border-gray-border">
                        <button onClick={() => setActiveTab('directory')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'directory' ? 'border-b-2 border-primary text-primary' : 'text-text-muted'}`}>Member Directory</button>
                        {permissions.members.viewGroupManagement && <button onClick={() => setActiveTab('groups')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'groups' ? 'border-b-2 border-primary text-primary' : 'text-text-muted'}`}>Group Management</button>}
                    </div>
                     {activeTab === 'directory' && (
                        <div className="flex items-center gap-2">
                            {selectedMemberIds.size > 0 && (
                                <>
                                    <span className="text-sm font-medium text-text-muted">{selectedMemberIds.size} selected</span>
                                    <Button size="sm" variant="outline" onClick={() => setSelectedMemberIds(new Set())} className="!p-1.5 h-auto">
                                        <XCircle size={16} />
                                    </Button>
                                    <div className="relative" ref={bulkActionsRef}>
                                        <Button onClick={() => setIsBulkActionsOpen(p => !p)}>
                                            Bulk Actions <MoreVertical size={16} className="ml-1" />
                                        </Button>
                                        {isBulkActionsOpen && (
                                            <div className="absolute top-full right-0 mt-2 w-64 origin-top-right rounded-md bg-gray-surface shadow-2xl border border-gray-border z-10 p-2">
                                                <div className="space-y-1">
                                                    <p className="px-3 pt-1 pb-2 text-xs font-semibold text-text-subtle uppercase">General</p>
                                                    <BulkActionMenuItem onClick={() => openBulkUpdateModal('group')}>Move to Group</BulkActionMenuItem>
                                                    <BulkActionMenuItem onClick={() => openBulkUpdateModal('class')}>Change Class</BulkActionMenuItem>
                                                    <BulkActionMenuItem onClick={() => openBulkUpdateModal('status')}>Change Status</BulkActionMenuItem>
                                                    {permissions.members.canDelete && <BulkActionMenuItem onClick={() => openConfirmation('delete')}>Delete Members</BulkActionMenuItem>}
                                                </div>
                                                <div className="space-y-1 mt-2 pt-2 border-t border-gray-border">
                                                    <p className="px-3 pt-1 pb-2 text-xs font-semibold text-text-subtle uppercase">Registration Forms</p>
                                                    <BulkActionMenuItem onClick={() => openConfirmation('regFormTrue')} icon={<Check/>}>Mark Form Completed</BulkActionMenuItem>
                                                    <BulkActionMenuItem onClick={() => openConfirmation('regFormFalse')} icon={<X/>}>Unmark Form</BulkActionMenuItem>
                                                </div>
                                                <div className="space-y-1 mt-2 pt-2 border-t border-gray-border">
                                                    <p className="px-3 pt-1 pb-2 text-xs font-semibold text-text-subtle uppercase">Health Information</p>
                                                    <BulkActionMenuItem onClick={() => openConfirmation('healthTrue')} icon={<Check/>}>Mark Health Info Provided</BulkActionMenuItem>
                                                    <BulkActionMenuItem onClick={() => openConfirmation('healthFalse')} icon={<X/>}>Unmark Health Info</BulkActionMenuItem>
                                                </div>
                                                <div className="space-y-1 mt-2 pt-2 border-t border-gray-border">
                                                    <p className="px-3 pt-1 pb-2 text-xs font-semibold text-text-subtle uppercase">Fees</p>
                                                    <BulkActionMenuItem onClick={() => openConfirmation('feesTrue')} icon={<Check/>}>Mark Fees Paid</BulkActionMenuItem>
                                                    <BulkActionMenuItem onClick={() => openConfirmation('feesFalse')} icon={<X/>}>Unmark Fees Paid</BulkActionMenuItem>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                            <Button variant="outline"><Download size={16} className="mr-2" /> Export CSV</Button>
                            {permissions.members.canAdd && <Button onClick={() => handleOpenModal()}><Plus size={16} className="mr-2" /> Add Member</Button>}
                        </div>
                     )}
                   </div>
                </Card>

                {activeTab === 'directory' && (
                    <Card>
                        <div className="mb-10 grid grid-cols-1 md:grid-cols-4 gap-3">
                             <input
                                type="text" placeholder="Search by name..." value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={inputStyles}
                            />
                             <select value={groupFilter} onChange={e => setGroupFilter(e.target.value)} className={selectStyles}>
                                <option value="all">All Groups</option>
                                {groups.map(g => <option key={g.name} value={g.name}>{g.name}</option>)}
                            </select>
                             <select value={classFilter} onChange={e => setClassFilter(e.target.value)} className={selectStyles}>
                                {['all', ...classes].map(c => <option key={c} value={c}>{c === 'all' ? 'All Classes' : c}</option>)}
                            </select>
                             <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={selectStyles}>
                                <option value="all">All Statuses</option>
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>
                         <div className="overflow-x-auto -mx-4 md:-mx-6">
                            <table className="w-full text-sm">
                                <thead className="text-left bg-gray-base">
                                    <tr>
                                        <th className="p-3 w-4">
                                            <input type="checkbox"
                                                ref={selectAllCheckboxRef}
                                                className="h-4 w-4 rounded text-primary bg-gray-input border-gray-border focus:ring-primary"
                                                onChange={handleSelectAll}
                                                checked={filteredMembers.length > 0 && selectedMemberIds.size === filteredMembers.length}
                                            />
                                        </th>
                                        <th className="p-3 font-medium text-text-muted">Name</th>
                                        <th className="p-3 font-medium text-text-muted">Group</th>
                                        <th className="p-3 font-medium text-text-muted hidden sm:table-cell">Class</th>
                                        <th className="p-3 font-medium text-text-muted hidden sm:table-cell">Age</th>
                                        <th className="p-3 font-medium text-text-muted">Status</th>
                                        <th className="p-3 font-medium text-text-muted text-center hidden md:table-cell">Reg. Form</th>
                                        <th className="p-3 font-medium text-text-muted text-center hidden md:table-cell">Health Info</th>
                                        <th className="p-3 font-medium text-text-muted text-center hidden md:table-cell">Fees Paid</th>
                                        <th className="p-3 font-medium text-text-muted">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredMembers.map(member => (
                                        <tr key={member.id} className={`border-b border-gray-border ${selectedMemberIds.has(member.id) ? 'bg-primary/10' : ''}`}>
                                            <td className="p-3">
                                                <input type="checkbox"
                                                    className="h-4 w-4 rounded text-primary bg-gray-input border-gray-border focus:ring-primary"
                                                    checked={selectedMemberIds.has(member.id)}
                                                    onChange={() => handleSelectOne(member.id)}
                                                />
                                            </td>
                                            <td className="p-3 font-semibold text-text-main">{member.fullName}</td>
                                            <td className="p-3 text-text-muted">
                                                <div className="flex items-center">
                                                    <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: groupColorMap.get(member.group) || '#ccc' }}></span>
                                                    {member.group}
                                                </div>
                                            </td>
                                            <td className="p-3 text-text-muted hidden sm:table-cell">{member.class}</td>
                                            <td className="p-3 text-text-muted hidden sm:table-cell">{calculateAge(member.dob)}</td>
                                            <td className="p-3">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${member.status === 'Active' ? 'bg-success/20 text-green-300' : 'bg-gray-light-border text-text-muted'}`}>
                                                    {member.status}
                                                </span>
                                            </td>
                                            <td className="p-3 text-center hidden md:table-cell"><Checkmark value={member.registration.form} /></td>
                                            <td className="p-3 text-center hidden md:table-cell"><Checkmark value={member.registration.healthInfo} /></td>
                                            <td className="p-3 text-center hidden md:table-cell"><Checkmark value={member.registration.feesPaid} /></td>
                                            <td className="p-3">
                                                <div className="flex gap-2">
                                                    {permissions.members.canEdit && <Button size="sm" variant="outline" onClick={() => handleOpenModal(member)}>Edit</Button>}
                                                    {permissions.members.canDelete && <Button size="sm" variant="danger" onClick={() => setMemberToDelete(member)}><Trash2 size={14} /></Button>}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}
                
                {activeTab === 'groups' && permissions.members.viewGroupManagement && (
                    <Card><GroupManagement /></Card>
                )}
            </div>
            <MemberModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                member={selectedMember}
                onSave={handleSaveMember}
                onSaveMultiple={handleSaveMultipleMembers}
                groups={groups}
                classes={classes}
            />
            <ConfirmationModal
                isOpen={!!memberToDelete}
                onClose={() => setMemberToDelete(null)}
                onConfirm={handleDeleteMember}
                title="Delete Member"
                message={`Are you sure you want to delete ${memberToDelete?.fullName}? All associated data (attendance, fees, etc.) will also be removed. This action is permanent.`}
            />
            {bulkUpdateConfig && (
                <BulkUpdateModal
                    isOpen={isBulkUpdateModalOpen}
                    onClose={() => setIsBulkUpdateModalOpen(false)}
                    title={bulkUpdateConfig.title}
                    label={bulkUpdateConfig.label}
                    options={bulkUpdateConfig.options}
                    onSave={handleBulkUpdateField}
                />
            )}
            {confirmationConfig && (
                 <ConfirmationModal
                    isOpen={!!confirmationConfig}
                    onClose={() => setConfirmationConfig(null)}
                    onConfirm={confirmationConfig.onConfirm}
                    title={confirmationConfig.title}
                    message={confirmationConfig.message}
                />
            )}
        </>
    );
};

export default Members;