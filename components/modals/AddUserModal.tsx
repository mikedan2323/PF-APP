import * as React from 'react';
import { AppUser, Role } from '../../types';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { api } from '../../services/api';
import { useAlert } from '../../App';
import Spinner from '../ui/Spinner';
import { RefreshCw } from 'react-feather';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserAdded: () => void;
}

const AddUserModal: React.FC<AddUserModalProps> = ({ isOpen, onClose, onUserAdded }) => {
    const [name, setName] = React.useState('');
    const [roles, setRoles] = React.useState<Role[]>([]);
    const [selectedRole, setSelectedRole] = React.useState('');
    const [code, setCode] = React.useState('');
    const [isShared, setIsShared] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [newUser, setNewUser] = React.useState<{ user: AppUser, code: string } | null>(null);
    const { addAlert } = useAlert();

    React.useEffect(() => {
        if(isOpen) {
            api.getRoles().then(res => {
                if(res.success) {
                    setRoles(res.data);
                    if(res.data.length > 0) setSelectedRole(res.data[0].name);
                }
            });
        }
    }, [isOpen]);

    const generateCode = () => {
        setCode(Math.floor(1000 + Math.random() * 9000).toString());
    }

    const resetState = () => {
        setName('');
        setSelectedRole(roles.length > 0 ? roles[0].name : '');
        setCode('');
        setIsShared(false);
        setLoading(false);
        setNewUser(null);
    };

    const handleClose = () => {
        resetState();
        onClose();
    };
    
    const handleDone = () => {
        onUserAdded();
        handleClose();
    }

    const handleSubmit = async () => {
        if (!name) return addAlert('Please enter a name for the new user.', 'warning');
        if (!code) return addAlert('Please enter or generate an access code.', 'warning');
        if (!selectedRole) return addAlert('Please select a role.', 'warning');
        
        setLoading(true);
        const res = await api.addUser(name, selectedRole, code, isShared);
        if (res.success && 'data' in res) {
            setNewUser(res.data);
            addAlert(`User '${name}' created successfully!`, 'success');
        } else if ('message' in res) {
            addAlert(res.message, 'error');
        } else {
            addAlert('An unknown error occurred.', 'error');
        }
        setLoading(false);
    };

    const inputStyles = "mt-1 w-full p-2 bg-gray-base border-gray-border rounded-md focus:ring-primary focus:border-primary";

    return (
        <Modal show={isOpen} onClose={handleClose} title={newUser ? 'User Created Successfully' : 'Add New User'} size="sm">
            <Spinner show={loading} />
            {newUser ? (
                <div className="text-center">
                    <p className="text-text-muted">The user <span className="font-bold text-text-main">{newUser.user.name}</span> has been created.</p>
                    <p className="mt-4">Their access code is:</p>
                    <div className="my-4 p-4 bg-gray-base border-2 border-dashed border-gray-border rounded-lg">
                        <p className="text-3xl font-bold tracking-widest text-primary">{newUser.code}</p>
                    </div>
                    <Button onClick={handleDone} className="mt-6 w-full">Done</Button>
                </div>
            ) : (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-text-muted">Full Name</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputStyles} placeholder="Enter user's name" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-muted">Role</label>
                        <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} className={inputStyles}>
                            {roles.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-text-muted">Access Code</label>
                        <div className="flex gap-2 mt-1">
                            <input type="text" value={code} onChange={(e) => setCode(e.target.value)} className={inputStyles} placeholder="Enter 4-digit code" />
                            <Button variant="outline" onClick={generateCode}><RefreshCw size={16}/></Button>
                        </div>
                    </div>
                    <div>
                        <label className="flex items-center text-sm font-medium text-text-muted">
                            <input type="checkbox" checked={isShared} onChange={(e) => setIsShared(e.target.checked)} className="mr-2 rounded text-primary focus:ring-primary"/>
                            Shared Account
                        </label>
                         <p className="text-xs text-text-subtle mt-1">If checked, users will be prompted for their name upon login.</p>
                    </div>
                    <div className="pt-4 flex justify-end gap-3">
                        <Button variant="outline" onClick={handleClose}>Cancel</Button>
                        <Button onClick={handleSubmit} disabled={loading}>Create User</Button>
                    </div>
                </div>
            )}
        </Modal>
    );
};

export default AddUserModal;