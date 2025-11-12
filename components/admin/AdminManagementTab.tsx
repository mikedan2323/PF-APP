import * as React from 'react';
import Spinner from '../ui/Spinner';
import { api } from '../../services/api';
import { AppUser } from '../../types';
import { Plus, Trash2, Edit, Shield, Lock } from 'react-feather';
import { useAlert, useUser } from '../../App';
import AddUserModal from '../modals/AddUserModal';
import Button from '../ui/Button';
import ConfirmationModal from '../modals/ConfirmationModal';
import EditUserModal from '../modals/EditUserModal';
import PermissionsModal from '../modals/PermissionsModal';
import EditAccessCodeModal from '../modals/EditAccessCodeModal';
import RoleManagement from '../admin/RoleManagement';

interface AdminManagementTabProps {
    onUserUpdate: (user: AppUser) => void;
}

const AdminManagementTab: React.FC<AdminManagementTabProps> = ({ onUserUpdate }) => {
    const user = useUser();
    const { addAlert } = useAlert();
    const [users, setUsers] = React.useState<AppUser[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [isAddUserModalOpen, setIsAddUserModalOpen] = React.useState(false);
    const [userToDelete, setUserToDelete] = React.useState<AppUser | null>(null);
    const [userToEdit, setUserToEdit] = React.useState<AppUser | null>(null);
    const [userToEditPermissions, setUserToEditPermissions] = React.useState<AppUser | null>(null);
    const [userToEditCode, setUserToEditCode] = React.useState<AppUser | null>(null);
    const [activeTab, setActiveTab] = React.useState<'users' | 'roles'>('users');
    
    const getCurrentUserName = () => user?.individualName ? `${user.individualName} (${user.name})` : user?.name || 'Unknown';

    const fetchData = async () => {
        setLoading(true);
        const res = await api.getUsers();
        if (res.success) {
            setUsers(res.data);
        }
        setLoading(false);
    };

    React.useEffect(() => {
        if(user?.permissions.adminPanel.management.view) {
            fetchData();
        } else {
            setLoading(false);
        }
    }, [user]);
    
    const handleUserAdded = () => {
        api.logAction(getCurrentUserName(), 'Admin: Add User', 'A new user was added to the system.');
        fetchData();
        setIsAddUserModalOpen(false);
    }
    
    const handleSaveUser = async (userId: string, data: { name: string; role: string }) => {
        setLoading(true);
        const res = await api.updateUser(userId, data);
        if (!res.success && 'message' in res) {
            addAlert(res.message, 'error');
        } else {
            addAlert('User updated successfully!', 'success');
            api.logAction(getCurrentUserName(), 'Admin: Edit User', `Updated details for user ${data.name} (ID: ${userId})`);
            await fetchData();
        }
        setLoading(false);
    };
    
    const handleDeleteUser = async () => {
        if (!userToDelete || !user) return;
        if (userToDelete.id === user.id) {
            addAlert("You cannot delete your own account.", "error");
            setUserToDelete(null);
            return;
        }
        setLoading(true);
        const res = await api.deleteUser(userToDelete.id);
        if (!res.success && 'message' in res) {
            addAlert(res.message, 'error');
        } else {
            addAlert(`User '${userToDelete.name}' has been deleted.`, 'success');
            api.logAction(getCurrentUserName(), 'Admin: Delete User', `Deleted user ${userToDelete.name} (ID: ${userToDelete.id})`);
            fetchData();
        }
        setUserToDelete(null);
        setLoading(false);
    };
    
    const handlePermissionsSaved = async (updatedUser: AppUser) => {
        await api.updateUserPermissions(updatedUser.id, updatedUser.permissions);
        addAlert(`Permissions for ${updatedUser.name} saved successfully!`, 'success');
        api.logAction(getCurrentUserName(), 'Admin: Edit Permissions', `Updated permissions for user ${updatedUser.name} (ID: ${updatedUser.id})`);
        
        // If the current user's permissions were changed, update the user state in App.tsx
        if (user && user.id === updatedUser.id) {
            onUserUpdate(updatedUser);
        }

        fetchData();
        setUserToEditPermissions(null);
    }

    if (loading || !user) return <Spinner show={true} />;
    
    return (
        <>
            <div className="flex justify-between items-center border-b border-gray-border mb-6 pb-4">
                <div className="flex">
                   <button onClick={() => setActiveTab('users')} className={`px-4 py-2 text-sm font-medium border-b-2 ${activeTab === 'users' ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text-main'}`}>User Management</button>
                   {user.permissions.adminPanel.management.canManageRoles && <button onClick={() => setActiveTab('roles')} className={`px-4 py-2 text-sm font-medium border-b-2 ${activeTab === 'roles' ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text-main'}`}>Role Management</button>}
               </div>
                {activeTab === 'users' && user.permissions.adminPanel.management.canAddUsers && <Button onClick={() => setIsAddUserModalOpen(true)}>
                   <Plus size={16} className="mr-1"/> Add User
               </Button>}
            </div>
            
            {activeTab === 'users' && (
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="text-left bg-gray-base">
                            <tr>
                                {['Name', 'Role', 'Type', 'Actions'].map(h => 
                                    <th key={h} className="p-3 font-medium text-text-muted">{h}</th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((appUser) => (
                                <tr key={appUser.id} className="border-b border-gray-border">
                                    <td className="p-3 font-semibold text-text-main">{appUser.name}</td>
                                    <td className="p-3 text-text-muted">{appUser.role}</td>
                                    <td className="p-3 text-text-muted">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${appUser.isShared ? 'bg-primary/20 text-primary' : 'bg-gray-light-border text-text-muted'}`}>
                                            {appUser.isShared ? 'Shared' : 'Individual'}
                                        </span>
                                    </td>
                                    <td className="p-3">
                                        <div className="flex gap-2">
                                            {user.permissions.adminPanel.management.canEditUsers && 
                                                <Button size="sm" variant="outline" onClick={() => setUserToEdit(appUser)} title="Edit User"><Edit size={14} /></Button>
                                            }
                                            {user.permissions.adminPanel.management.canEditAccessCodes &&
                                                <Button size="sm" variant="outline" onClick={() => setUserToEditCode(appUser)} title="View/Edit Access Code"><Lock size={14} /></Button>
                                            }
                                            {user.permissions.adminPanel.management.canEditPermissions &&
                                                <Button size="sm" variant="outline" onClick={() => setUserToEditPermissions(appUser)} title="Manage Permissions"><Shield size={14} /></Button>
                                            }
                                            {user.permissions.adminPanel.management.canDeleteUsers &&
                                                <Button size="sm" variant="danger" onClick={() => setUserToDelete(appUser)} title="Delete User"><Trash2 size={14} /></Button>
                                            }
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'roles' && user.permissions.adminPanel.management.canManageRoles && (
                <RoleManagement onUserUpdate={onUserUpdate} />
            )}

            <AddUserModal
                isOpen={isAddUserModalOpen}
                onClose={() => setIsAddUserModalOpen(false)}
                onUserAdded={handleUserAdded}
            />
             <ConfirmationModal
                isOpen={!!userToDelete}
                onClose={() => setUserToDelete(null)}
                onConfirm={handleDeleteUser}
                title="Delete User"
                message={`Are you sure you want to delete ${userToDelete?.name}? This action is permanent and cannot be undone.`}
            />
            <EditUserModal
                isOpen={!!userToEdit}
                onClose={() => setUserToEdit(null)}
                user={userToEdit}
                onSave={handleSaveUser}
            />
            <PermissionsModal
                isOpen={!!userToEditPermissions}
                onClose={() => setUserToEditPermissions(null)}
                user={userToEditPermissions}
                onSave={handlePermissionsSaved}
            />
            <EditAccessCodeModal
                isOpen={!!userToEditCode}
                onClose={() => setUserToEditCode(null)}
                user={userToEditCode}
            />
        </>
    );
};

export default AdminManagementTab;