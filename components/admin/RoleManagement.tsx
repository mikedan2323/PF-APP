// Implemented the RoleManagement component for the Admin page to resolve module resolution errors.
import * as React from 'react';
import Button from '../ui/Button';
import { api } from '../../services/api';
import { Role, Permissions, AppUser } from '../../types';
import { Edit, Shield, Trash2 } from 'react-feather';
import { useAlert, useUser } from '../../App';
import PermissionsModal from '../modals/PermissionsModal';
import ConfirmationModal from '../modals/ConfirmationModal';
import Modal from '../ui/Modal';

interface AddRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (roleName: string) => void;
}

const AddRoleModal: React.FC<AddRoleModalProps> = ({ isOpen, onClose, onSave }) => {
  const [roleName, setRoleName] = React.useState('');

  const handleSave = () => {
    if (roleName.trim()) {
      onSave(roleName.trim());
    }
  };
  
  React.useEffect(() => {
    if (isOpen) {
        setRoleName('');
    }
  }, [isOpen]);

  return (
    <Modal show={isOpen} onClose={onClose} title="Create New Role">
      <div>
        <label className="block text-sm font-medium text-text-muted">Role Name</label>
        <input
          type="text"
          value={roleName}
          onChange={(e) => setRoleName(e.target.value)}
          className="mt-1 w-full p-2 bg-gray-base border-gray-border rounded-md focus:ring-primary focus:border-primary"
          placeholder="e.g., Secretary"
        />
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} disabled={!roleName.trim()}>Create Role</Button>
      </div>
    </Modal>
  );
};

interface RenameRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newName: string) => void;
  currentName: string;
}

const RenameRoleModal: React.FC<RenameRoleModalProps> = ({ isOpen, onClose, onSave, currentName }) => {
  const [roleName, setRoleName] = React.useState(currentName);

  React.useEffect(() => {
    if (isOpen) {
        setRoleName(currentName);
    }
  }, [isOpen, currentName]);

  const handleSave = () => {
    if (roleName.trim() && roleName.trim() !== currentName) {
      onSave(roleName.trim());
    } else if (roleName.trim() === currentName) {
      onClose(); // Just close if name is unchanged
    }
  };

  return (
    <Modal show={isOpen} onClose={onClose} title={`Rename "${currentName}"`}>
      <div>
        <label className="block text-sm font-medium text-text-muted">New Role Name</label>
        <input
          type="text"
          value={roleName}
          onChange={(e) => setRoleName(e.target.value)}
          className="mt-1 w-full p-2 bg-gray-base border-gray-border rounded-md focus:ring-primary focus:border-primary"
          placeholder="Enter new role name"
        />
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} disabled={!roleName.trim()}>Save Changes</Button>
      </div>
    </Modal>
  );
};

interface RoleManagementProps {
    onUserUpdate: (user: AppUser) => void;
}

const RoleManagement: React.FC<RoleManagementProps> = ({ onUserUpdate }) => {
    const [roles, setRoles] = React.useState<Role[]>([]);
    const [roleToEdit, setRoleToEdit] = React.useState<Role | null>(null);
    const [roleToDelete, setRoleToDelete] = React.useState<Role | null>(null);
    const [roleToRename, setRoleToRename] = React.useState<Role | null>(null);
    const [isAddRoleModalOpen, setIsAddRoleModalOpen] = React.useState(false);
    const { addAlert } = useAlert();
    const user = useUser();

    const fetchRoles = () => {
        api.getRoles().then(res => res.success && setRoles(res.data));
    };

    React.useEffect(() => {
        fetchRoles();
    }, []);
    
    const getCurrentUserName = () => user?.individualName ? `${user.individualName} (${user.name})` : user?.name || 'Unknown';


    const handleAddRole = async (roleName: string) => {
        const res = await api.addRole(roleName);
        if (res.success) {
            addAlert(`Role "${roleName}" created successfully.`, 'success');
            api.logAction(getCurrentUserName(), 'Admin: Create Role', `Created new role: ${roleName}`);
            fetchRoles();
            setIsAddRoleModalOpen(false);
        } else if ('message' in res) {
            addAlert(res.message, 'error');
        }
    };

    const handleSavePermissions = async (permissions: Permissions) => {
        if (!roleToEdit || !user) return;
        
        const res = await api.updateRolePermissions(roleToEdit.id, permissions);

        if (res.success) {
            addAlert(`Permissions for ${roleToEdit.name} role updated.`, 'success');
            api.logAction(getCurrentUserName(), 'Admin: Edit Role Permissions', `Updated permissions for role: ${roleToEdit.name}`);
            // If the user's own role was edited, update their session immediately
            if (user.role === roleToEdit.name) {
                onUserUpdate({ ...user, permissions });
                addAlert('Your permissions have been updated and applied immediately.', 'success');
            }
             fetchRoles();
        } else if ('message' in res) {
            addAlert(res.message, 'error');
        }
        
        setRoleToEdit(null);
    };
    
    const handleDelete = () => {
        if (!roleToDelete) return;
        // In a real app, this would be an API call
        setRoles(roles.filter(r => r.id !== roleToDelete.id));
        addAlert(`Role ${roleToDelete.name} deleted.`, 'success');
        api.logAction(getCurrentUserName(), 'Admin: Delete Role', `Deleted role: ${roleToDelete.name}`);
        setRoleToDelete(null);
    }

    const handleSaveRoleName = async (newName: string) => {
        if (!roleToRename) return;
        const res = await api.updateRole(roleToRename.id, newName);
        if (res.success) {
            addAlert(`Role "${roleToRename.name}" renamed to "${newName}".`, 'success');
            api.logAction(getCurrentUserName(), 'Admin: Rename Role', `Renamed role "${roleToRename.name}" to "${newName}"`);
            fetchRoles();
            setRoleToRename(null);
        } else if ('message' in res) {
            addAlert(res.message, 'error');
        }
    };

    return (
        <>
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <p className="text-text-muted text-sm">Define roles and manage their permissions across the application.</p>
                    <Button onClick={() => setIsAddRoleModalOpen(true)}>Create Role</Button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-base text-left">
                            <tr>
                                <th className="p-3 font-medium text-text-muted">Role Name</th>
                                <th className="p-3 font-medium text-text-muted">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {roles.map(role => (
                                <tr key={role.id} className="border-b border-gray-border">
                                    <td className="p-3 font-semibold text-text-main">{role.name}</td>
                                    <td className="p-3">
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="outline" onClick={() => setRoleToEdit(role)}>
                                                <Shield size={14} className="mr-1" /> Manage Permissions
                                            </Button>
                                            <Button size="sm" variant="outline" onClick={() => setRoleToRename(role)}><Edit size={14} /> Rename</Button>
                                            <Button size="sm" variant="danger" onClick={() => setRoleToDelete(role)}><Trash2 size={14} /> Delete</Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <PermissionsModal
                isOpen={!!roleToEdit}
                onClose={() => setRoleToEdit(null)}
                user={null}
                role={roleToEdit}
                onRolePermissionsSave={handleSavePermissions}
                onSave={() => {}} // Dummy prop
            />

            <ConfirmationModal
                isOpen={!!roleToDelete}
                onClose={() => setRoleToDelete(null)}
                onConfirm={handleDelete}
                title="Delete Role"
                message={`Are you sure you want to delete the "${roleToDelete?.name}" role? Users with this role will lose their permissions.`}
            />

            <AddRoleModal
                isOpen={isAddRoleModalOpen}
                onClose={() => setIsAddRoleModalOpen(false)}
                onSave={handleAddRole}
            />

            <RenameRoleModal
                isOpen={!!roleToRename}
                onClose={() => setRoleToRename(null)}
                onSave={handleSaveRoleName}
                currentName={roleToRename?.name || ''}
            />
        </>
    );
};

export default RoleManagement;